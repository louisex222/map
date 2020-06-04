//製作地圖初始點
let map 
map = L.map('map').setView([24.13,120.66],12);
map.locate({maxZoom:16})
//建立地圖
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '<a href="https://www.openstreetmap.org/">OSM</a> | Made by Kevin Hsu',
  maxZoom: 19,
}).addTo(map);
let sideBar = document.querySelector('#sidebar');
let showSideBtn = document.querySelector('.showSideBtn');
let countrys = document.querySelector('#country');
let districts = document.querySelector('#district');
let resultList = document.querySelector('.resultList')
let maskData;
let zoneData;
countrys.addEventListener('change',selectDistrict)
// countrys.addEventListener('change',selectDistrict)
//載入資料取地區
function getzoneJSON(){
    let xhr = new XMLHttpRequest()
    xhr.open('get','https://raw.githubusercontent.com/kevinshu1995/maskmap/gh-pages/latlng.json')
    xhr.send()
    xhr.onload=function(){
        if(xhr.status==200 &xhr.readyState==4){
            zoneData =  JSON.parse(xhr.responseText)
        }else {
            alert('讀取失敗')
        }
        selectCity()
        // console.log(zoneData)
    }
    
}
getzoneJSON();
//載入資料取口罩
function  getmaskJSON(){
    let xhr = new XMLHttpRequest()
    xhr.open('get','https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json?fbclid=IwAR3XtDf10Tocq8nHU3kLdEtLvAb_yBIPum9i_t2m_wsHMV41ZdufKpWjDu4')
    xhr.send()
    xhr.onload = function(){
        if(xhr.status==200 &xhr.readyState ==4){
            maskData = JSON.parse(xhr.responseText).features
            mapData()
            selectCity()
            list('西區','臺中市')
        }else{
            alert('讀取失敗')
            
        }
        // console.log(maskData)
    }
    
}
getmaskJSON()

//地區資料放入選單
function selectCity(){
    let country
    let countryArr = []
    for (let i=0 ; i< zoneData.length;i++){
        let countryStr = zoneData[i].city
       countryArr.push(countryStr)
    }
    //篩選重複的縣市
    country = countryArr.filter((value,index,arr)=>{
        return  arr.indexOf(value)===index
    })
    // console.log(country)
    optionCity(country)
}
// /將縣市放入選單內
function optionCity(country){
    let option = `<option value="">請選擇縣市</option>`
    for(let i=0 ; i<country.length ; i++){
        option += `<option value="${country[i]}">${country[i]}</option>`
    }
    countrys.innerHTML = option
}
//建立地區資料

function selectDistrict(e){
    let districtArr =[]
    let value = e.target.value
    for (let i =0; i< zoneData.length;i++){
        if(zoneData[i].city==value){
        districtArr.push({ district: zoneData[i].district})
        }
    }
    console.log(districtArr)
    optionDistrict(districtArr)
    
}
//將地區放入選單
function optionDistrict(districtArr){
    let option = `<option value="">請選擇地區</option>`
    for(let i=0 ; i<districtArr.length ; i++){
        option+= `<option value="${districtArr[i].district}">${districtArr[i].district}</option>`
    }
    districts.innerHTML = option
    districts.addEventListener('change',locationlist)
    
}

//資料匯入列表
function locationlist(e){
    let district = e.target.value;
    let country = '';
    let latlng = []
    for( let i=0; i<zoneData.length; i++){
        if(zoneData[i].city== countrys.value & zoneData[i].district ==district){
            lating = [zoneData[i].lat,zoneData[i].lng]
            country = zoneData[i].city 
        }
    }
    list(district,country)
}
function list(district,country){
    let defaultList = `<li class="resultList-defaultList">${country}${district}</li>`
    
    for(let i =0; i<maskData.length; i++){
        let store =  maskData[i].properties.name
        let address = maskData[i].properties.address
        let phone = maskData[i].properties.phone
        let adultMask = maskData[i].properties.mask_adult
        let childMask = maskData[i].properties.mask_child
        //抓到第一個質的時候

        if(address.indexOf(country &&  district) != -1){
        defaultList +=`
        <li class="resultList-wrap">
            <div class="storeBox">
                <h2 class="storename">${store}</h2>
                <a href ="https://www.google.com.tw/maps/place/${store}">
                    <i class="fas fa-directions"></i></a>
            </div>
            <h3><i class="fas fa-map-marker-alt"></i>地址 : ${address}</h3>
            <h3><i class="fas fa-phone-alt"></i> 電話 : ${phone}</h3>
            <ul>
                <li>成人口罩 ${adultMask} 個</li>
                <li>兒童口罩 ${childMask} 個</li>
            </ul>
        <li>
        `
        }
    }
    resultList.innerHTML = defaultList
    let  pointList = document.querySelectorAll('.resultList-wrap')
    let  point = document.querySelectorAll('.storename')
    addEventMarker(point,pointList)
   
}

//將資料設置地圖標點
function mapData(){
    let mapdata = []
    for(let i=0 ; i< maskData.length ; i++){
        let country = maskData[i].properties.county
        mapdata.push({
            store: maskData[i].properties.name,
            address: maskData[i].properties.address,
            phone: maskData[i].properties.phone,
            adultMask: maskData[i].properties.mask_adult,
            childMask: maskData[i].properties.mask_child,
            geometry: maskData[i].geometry.coordinates.reverse(),
        })
    }
    setmapData(mapdata)
}
let markers = new L.MarkerClusterGroup().addTo(map)
function setmapData(mapdata){
    let niceIcon = new L.Icon({
        iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
    for(let i=0;i<mapdata.length ; i++){
        markers.addLayer(L.marker(mapdata[i].geometry,{icon:niceIcon})
    .bindPopup(
        `
            <li class="resultList-wrap" style="padding: 10px 10px">
                <div class="storeBox">
                    <h2 class="storename">${mapdata[i].store}</h2>
                    <a href ="https://www.google.com.tw/maps/place/${mapdata[i].store}">
                        <i class-"fas fa-directions"></i></a>
                </div>
                <h3><i class="fas fa-map-marker-alt"></i>地址 : ${mapdata[i].address}</h3>
                <h3><i class="fas fa-phone-alt"></i> 電話 : ${mapdata[i].phone}</h3>
                <ul>
                    <li style=" margin: 0 10px;border: 2px solid #A4D5F4;border-radius: 10px;height: 20px;padding:  10px 10px;color: #14699F;font-size: 12px;font-weight: 900;">成人口罩 ${mapdata[i].adultMask} 個</li>
                    <li style=" margin: 0 10px;border: 2px solid #A4D5F4;border-radius: 10px;height: 20px;padding:  10px 10px;color: #14699F;font-size: 12px;font-weight: 900;">兒童口罩 ${mapdata[i].childMask} 個</li>
                </ul>
            </li>  
        
        `
    ))
    }
}

//選擇點跳轉座標
function addEventMarker(point,pointList){
  for( let i=0 ; i< pointList.length; i++){
      pointList[i].addEventListener('click',jumptoMarker)
      
  }
}
function jumptoMarker(e){
 let name = e.target.innerHTML
 for(let i=0 ; i< maskData.length ; i++){
     if(maskData[i].properties.name ==name){
         locate = [maskData[i].geometry.coordinates[0],maskData[i].geometry.coordinates[1]]
         let ajustLocate= L.latLng(locate[0], locate[1] - 0.0009);
         map.setView(ajustLocate, 18)
     }
 }
}

// 調整選單

showSideBtn.onclick = function(){
    if(sideBar.className.includes('move')){
        sideBar.className = 'sidebar in'
    }else{
        sideBar.classList.add('move')
        sideBar.classList.remove('in')
    }
     
}