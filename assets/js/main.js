var mapContainer = document.getElementById('map'),
    mapOption = {
        center: new kakao.maps.LatLng(35.834685, 128.682313), // 지도의 중심좌표.
        level: 3, // 지도의 확대 레벨.
    };

var map = new kakao.maps.Map(mapContainer, mapOption); // 지도를 생성.

var overlay; // 커스텀 오버레이

// 장소 검색 객체를 생성.
var ps = new kakao.maps.services.Places(map);

// 카테고리로 주차장을 검색.
ps.categorySearch('PK6', placesSearchCB, { useMapBounds: true });

// 마커 정보를 담은 객체 배열
var markers = [];

// 키워드 검색 완료 시 호출되는 콜백함수.
function placesSearchCB(data, status, pagination) {
    if (status === kakao.maps.services.Status.OK) {
        for (var i = 0; i < data.length; i++) {
            displayMarker(data[i], i + 1); // i + 1은 마커 식별자로 사용
        }
    }
}

// 커스텀 오버레이 닫기.
function closeOverlay() {
    if (overlay) {
        overlay.setVisible(false);
    }
}

// 입차 버튼 클릭 시 주차 가능 대수 -1
function parkIn(th) {
    var markerIndex = $(th).data('marker-index');
    var carCnt = markers[markerIndex].car;
    if (carCnt != 0) {
        carCnt -= 1;
        markers[markerIndex].car = carCnt;
        updateOverlayContent(markers[markerIndex]);
    }
}

// 출차 버튼 클릭 시 주차 가능 대수 +1
function parkOut(th) {
    var markerIndex = $(th).data('marker-index');
    var carCnt = markers[markerIndex].car;
    if (carCnt < 5) {
        carCnt += 1;
        markers[markerIndex].car = carCnt;
        updateOverlayContent(markers[markerIndex]);
    }
}

// 지도에 마커를 표시하는 함수.
function displayMarker(place, markerIndex) {
    // 마커를 생성하고 지도에 표시.
    var marker = new kakao.maps.Marker({
        map: map,
        position: new kakao.maps.LatLng(place.y, place.x),
    });

    markers[markerIndex] = {
        marker: marker,
        car: 5, // 초기 주차 가능 대수
        place: place, // place 정보 추가
    };

    // 마커에 클릭이벤트를 등록.
    kakao.maps.event.addListener(marker, 'click', function () {
        if (overlay == null) {
            // 새로운 overlay를 생성.
            overlay = new kakao.maps.CustomOverlay({
                map: map,
            });
        }

        // 마커를 클릭하면 상세정보가 오버레이에 표출.
        updateOverlayContent(markers[markerIndex]);

        overlay.setVisible(true);
    });

    // 더블클릭 시 지도 확대 방지.
    kakao.maps.event.addListener(map, 'dblclick', function (event) {
    event.preventDefault();
    });
}


// 오버레이의 내용 업데이트.
function updateOverlayContent(markerInfo) {
    var place = markerInfo.place;

    var content = 
    '<div class="wrap">' +
    '   <div class="info">' +
    '       <div class="title">' +
                place.place_name +
    '           <div class="close" onclick="closeOverlay()" title="닫기"></div>' +
    '       </div>' +
    '       <div class="body">' +
    '           <div class="img">' +
    '               <img src="/assets/images/p.png" width="73" height="73">' +
    '           </div>' +
    '           <div class="desc">' +
    '               <div class="available">주차 가능 대수</div>' +
    '               <div class="cnt">' + markerInfo.car + '</div>' +
    '               <div class="buttons">' +
    '                   <button class="plus" onclick="parkIn(this)" data-marker-index="' +
                            markers.indexOf(markerInfo) +
                        '">입차</button>' +
    '                   <button class="minus" onclick="parkOut(this)" data-marker-index="' +
                            markers.indexOf(markerInfo) +
                        '">출차</button>' +
    '               </div>' +
    '               <div class="ellipsis">' +
    '                   <p>' + place.road_address_name + '</p>' +
    '                   <p>(지번) ' + place.address_name + '</p>' +
    '               </div>' +
    '           </div>' +
    '       </div>' +
    '   </div>' +
    '</div>';

    // 오버레이 콘텐츠와 위치를 업데이트.
    overlay.setContent(content);
    overlay.setPosition(markerInfo.marker.getPosition());
}