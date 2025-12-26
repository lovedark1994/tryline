// 接受兩個變數：rt (runtime) 與 mode (0 為寫入, 1 為讀取)
window.fetchGasData = function(rt, mode) {
    if (!rt) {
        console.error("腳本呼叫失敗：沒有傳入 runtime 參數！");
        return;
    }

    const baseUrl = "https://script.google.com/macros/s/AKfycbycb73uf529EJECnc80W4byxzStlCxtZfMay_-xm_8LGrn4m9E/exec";
    const cbName = "cb_" + Date.now();
    let finalUrl = "";

    if (mode === 1) {
        // --- 模式 1：讀取資料 ---
        finalUrl = `${baseUrl}?need=1&callback=${cbName}&t=${Date.now()}`;
    } else {
        // --- 模式 0：寫入資料 ---
        // 從 C3 的全域變數讀取資料 (請確保名稱與 C3 內一致)
        const name = encodeURIComponent(rt.globalVars.名字); 
        const talk = encodeURIComponent(rt.globalVars.評論);
        const star = rt.globalVars.星數;
        
        // 組合寫入用的網址，同樣加上 callback 讓 GAS 能回傳 OK
        finalUrl = `${baseUrl}?need=0&name=${name}&talk=${talk}&star=${star}&callback=${cbName}&t=${Date.now()}`;
    }

    // 定義回傳處理
    window[cbName] = function(data) {
        rt.globalVars.back = JSON.stringify(data);
        rt.signal("GAS_LOADED"); // 通知 C3 資料已處理完畢
        
        // 清理環境
        delete window[cbName];
        const s = document.getElementById(cbName);
        if (s) s.remove();
    };

    // 執行 Script 注入 (JSONP)
    const script = document.createElement('script');
    script.id = cbName;
    script.src = finalUrl;
    script.onerror = () => {
        console.error("GAS 連線失敗");
        rt.signal("GAS_ERROR");
    };
    document.body.appendChild(script);
};