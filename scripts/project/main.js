// 接受一個傳進來的變數 rt
window.fetchGasData = function(rt) {
    if (!rt) {
        console.error("腳本呼叫失敗：沒有傳入 runtime 參數！");
        return;
    }

    const baseUrl = "https://script.google.com/macros/s/AKfycbycb73uf529EJECnc80W4byxzStlCxtZfMay_-xm_8LGrn4m9E/exec";
    const cbName = "cb_" + Date.now();
    const finalUrl = `${baseUrl}?need=1&callback=${cbName}&t=${Date.now()}`;

    window[cbName] = function(data) {
        // 使用傳入的 rt 進行操作
        rt.globalVars.back = JSON.stringify(data);
        rt.signal("GAS_LOADED");
        
        delete window[cbName];
        const s = document.getElementById(cbName);
        if (s) s.remove();
    };

    const script = document.createElement('script');
    script.id = cbName;
    script.src = finalUrl;
    script.onerror = () => rt.signal("GAS_ERROR");
    document.body.appendChild(script);
};