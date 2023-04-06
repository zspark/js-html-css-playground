/**
 * IndexedDB数据库管理帮助类
 * @param {Object} option 数据库配置信息
 * @param {String} option.name 数据库名称
 * @param {Number} option.version 数据库版本
 * @param {Array} option.storeList 数据库包含的所有表名
 */
class IndexedDBHelper {
  constructor(option) {
    this.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
    if(!this.indexedDB) {
      console.log('IndexedDB not supported');
    }
    this._db = null;
    this._opt = option;
    this._onOpening = false;
    this._onOpeningResolves = [];
    this._onOpeningRejects = [];
    this._temp = {};
  }

  /**
   * 打开indexedDB数据库
   * @param {String} dbName 数据库name，默认为BimfaceData
   * @param {Number} version 数据库版本号
   * @returns {Promise} 打开数据库的执行结果
   */
  open(dbName, version) {
    this._onOpening = true;
    const name = dbName || this._opt.name;
    const ver = version || this._opt.version;  // 创建新表时需要升级version
    const dbRequest = this.indexedDB.open(name, ver);

    return new Promise((resolve, reject) => {
      dbRequest.onsuccess = (event) => {
        let _db = dbRequest.result;
        let needsUpdate = false;
        if(this._opt.storeList) {
          let cStoreList = Object.values(_db.objectStoreNames);
          this._opt.storeList.some((storeName)=> {
            if(cStoreList.indexOf(storeName) === -1) {  // 若传入参数存在新的storeName，则关闭db，升级版本重新打开
              let {name, version} = _db;
              version++;
              _db.close();
              this.open(name, version).then(resolve).catch(reject);
              return needsUpdate = true;
            }
          })
        }
        if(!needsUpdate) {
          this._db = _db;
          resolve(_db);
        }
      }

      dbRequest.onupgradeneeded = (event) => {
        let _db = this._db = event.target.result;
        let storeList = this._opt.storeList || [];
        storeList.forEach((storeName)=> !_db.objectStoreNames.contains(storeName) && _db.createObjectStore(storeName));
        let cStoreList = Object.values(_db.objectStoreNames);
        cStoreList.forEach((storeName)=> storeList.indexOf(storeName) === -1 && _db.deleteObjectStore(storeName));
      }

      dbRequest.onerror = (event) => {
        reject(event);
      }
    })
  }

  /**
   * 获取数据库对象，兼容数据库已打开/未打开状态
   * @returns {Promise} 数据库对象结果
   */
  getDB() {
    return new Promise((resolve, reject)=> {
      if(this._db) {
        resolve(this._db);
      } else if(this._onOpening) {
        this._onOpeningResolves.push(resolve);
        this._onOpeningRejects.push(reject);
      } else {
        this.open()
          .then((_db)=> {
            resolve(_db);
            this._onOpeningResolves.forEach((fn)=> fn(_db));
          }
          ).catch((err)=> {
            reject(err);
            this._onOpeningRejects.forEach((fn)=> fn(err));
          });
      }
    })
  }

  /**
   * 向数据库表中添加/修改一条记录
   * @param {String} storeName 表名
   * @param {Any} object 记录内容
   * @param {String} key 记录的键，目前是以资源url为键
   * @returns {Promise} 添加/修改结果
   */
  addObject(storeName, object, key) {
    return new Promise((resolve, reject)=> {
      this.getDB().then((_db)=> {
        if(!_db.objectStoreNames.contains(storeName)) {
          reject();
          return;
        }
        const tranRequest = _db.transaction(storeName, 'readwrite')
        tranRequest
          .objectStore(storeName)
          .put(object, key)
          .onsuccess = (event) => {
            if(this._temp[storeName] && this._temp[storeName].keys) {
              this._temp[storeName].keys.push(key);
              this._temp[storeName].map[key] = object;
            }
            resolve(event.target.result)
          }
        tranRequest.onerror = reject;
      }).catch(reject);
    })
  }

  /**
   * 根据表名和键返回对应的记录值
   * @param {String} storeName 表名
   * @param {String} key 记录的键
   * @param {Boolean} useCache 是否启用缓存
   * @returns {Promise} 获取记录值的结果
   */
  getObject(storeName, key, useCache = false) {
    return useCache ? new Promise((resolve, reject)=> {  // 启用缓存，第一次从某个store中取值时，将同时获取该store所有内容并缓存，后续请求该store其他内容时，从缓存中取
      if(this._temp[storeName]) {
        let tempData = this._temp[storeName].map[key];
        if(tempData) {  // 缓存中有值则直接返回
          resolve(tempData);
          // delete this._temp[storeName].map[key];  // 取一次后清掉，减小缓存占用内存
          return;
        } else if(this._temp[storeName].keys.indexOf(key) === -1) {  // 当前store的keys不包含传入的key，表示未存储过这条数据，直接reject
          reject();
          return;
        }
      }
      this.getDB().then((_db)=> {
        if(!_db.objectStoreNames.contains(storeName)) {
          reject();
          return;
        }
        const tranRequest = _db.transaction(storeName, 'readonly');
        const store = tranRequest.objectStore(storeName);
        let getAllKeys = new Promise((resolve1)=> store.getAllKeys().onsuccess = (event)=> resolve1(event.target.result));
        let getAll = new Promise((resolve1)=> store.getAll().onsuccess = (event)=> resolve1(event.target.result));
        Promise.all([getAllKeys, getAll]).then((results)=> {
          let [keys, values] = results;
          this._temp[storeName] = {keys, map: {}};
          let got = false;
          keys.forEach((cKey, index)=> {
            if(key === cKey) {
              resolve(values[index]);
              got = true;
            } else {
              this._temp[storeName].map[cKey] = values[index];
            }
          });
          got || reject();
        })

        tranRequest.onerror = reject;
      }).catch(reject);

      
    }) : new Promise((resolve, reject)=> {
      this.getDB().then((_db)=> {
        if(!_db.objectStoreNames.contains(storeName)) {
          reject();
          return;
        }
        const tranRequest = _db.transaction(storeName, 'readonly');
        const store = tranRequest.objectStore(storeName);
        const dbRequest = store.get(key);

        dbRequest.onsuccess = (event) => {
          let result = event.target.result;
          result ? resolve(result) : reject(event);
        }
        tranRequest.onerror = reject;
      }).catch(reject);
    })
  }

  /**
   * 根据表名和键删除对应的记录值
   * @param {String} storeName 表名
   * @param {String} key 记录的键
   * @returns {Promise} 删除记录值的结果
   */
  deleteObject(storeName, key) {
    return new Promise((resolve, reject)=> {
      this.getDB().then((_db)=> {
        if(!_db.objectStoreNames.contains(storeName)) {
          reject();
          return;
        }
        const tranRequest = _db.transaction(storeName, 'readwrite')
        tranRequest
          .objectStore(storeName)
          .delete(key)
          .onsuccess = (event) => {
            resolve(event.target.result)
          }
        tranRequest.onerror = reject;
      }).catch(reject);
    })
  }
}

CLOUD.Storage = CLOUD.Storage || {};
CLOUD.Storage.IndexedDBHelper = IndexedDBHelper;

/**
 * 统一处理是否使用本地缓存的方式加载资源
 * @param {String} type 'InfoData', 'ModelData', 'Bimtiles', 'Texture'
 * @param {String} url 资源路径
 * @param {Function} load 加载资源的方法，返回一个Promise
 * @param {Function} successCallback 获取资源成功回调
 * @param {Function} errorCallback 获取资源失败回调
 * @param {Boolean} saveJson 是否将内容转为Json字符串存储/读取
 */
CLOUD.Storage.IndexedDBHelper.loadWithStorage = (type, url, load, successCallback, errorCallback, saveJson = false)=> {
  let loadByUrl = ()=> {
    load(url)
      .then((data)=> {
        let result = saveJson ? JSON.stringify(data) : data;
        CLOUD.EnableStorage && CLOUD.storageManager[`add${type}`](result, url);
        successCallback && successCallback(data);
      }).catch((err)=> errorCallback && errorCallback(err));
  }
  if(CLOUD.EnableStorage) {
    CLOUD.storageManager[`get${type}`](url)
      .then((data)=> {
        let result = saveJson ? JSON.parse(data) : data;
        successCallback && successCallback(result);
      }).catch((err)=> {
        loadByUrl();
      })
  } else {
    loadByUrl();
  }
}