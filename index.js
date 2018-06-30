if(navigator.serviceWorker) {
    navigator.serviceWorker
        .register('./sw.js', {scope: './'})
        .then(()=>console.log('SW Registered'))
        .catch(()=>{throw new Error('Something went wrong while registering the service worker')})
}