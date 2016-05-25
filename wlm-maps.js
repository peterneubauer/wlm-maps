/*
 * Original code: https://github.com/chillly/plaques/blob/master/example3.js
 * 
 * Created by Chris Hill <osm@raggedred.net> and contributors.
 * Adapted for Wiki Loves Monuments by Emijrp <emijrp@gmail.com>
 * Adapted for Mapillary by peterneubauer <peter@neubauer.se>
 * 
 * This software and associated documentation files (the "Software") is
 * released under the CC0 Public Domain Dedication, version 1.0, as
 * published by Creative Commons. To the extent possible under law, the
 * author(s) have dedicated all copyright and related and neighboring
 * rights to the Software to the public domain worldwide. The Software is
 * distributed WITHOUT ANY WARRANTY.
 * 
 * If you did not receive a copy of the CC0 Public Domain Dedication
 * along with the Software, see
 * <http://creativecommons.org/publicdomain/zero/1.0/>
 */

var map;
var layerOSM;
var layerMonuments;
var withimageicon;
var withoutimageicon;

$(document).ready(init);

function init() {


    var osmUrl = '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    var osmAttrib = 'Map data &copy; <a href="//openstreetmap.org" target="_blank">OpenStreetMap</a> contributors | <a href="//commons.wikimedia.org/wiki/Commons:Monuments_database" target="_blank">Monuments database</a> by Wikipedia editors | <a href="//github.com/peterneubauer/wlm-maps" target="_blank">Source code</a> by <a href="//en.wikipedia.org/wiki/User:Emijrp" target="_blank">emijrp</a> and peterneubauer in GitHub';

    withimageicon = L.icon({
        iconUrl: 'icons/withimageicon.png',
        iconSize: [32, 32],
        iconAnchor: [16, 31],
        popupAnchor: [0, -16]
    });

    withoutimageicon = L.icon({
        iconUrl: 'icons/withoutimageicon.png',
        iconSize: [32, 32],
        iconAnchor: [16, 31],
        popupAnchor: [0, -16]
    });

    layerOSM = new L.TileLayer(osmUrl, {
        minZoom: 2,
        maxZoom: 19,
        attribution: osmAttrib
    });

    layerMonuments = L.geoJson(null, {
        pointToLayer: setMarker
    });
    var start = new L.LatLng(0, 0);

    // create the map
    map = new L.Map('mapdiv', {
        center: start,
        zoom: 2,
        layers: [layerOSM, layerMonuments]
    });
    L.control.scale().addTo(map);

    var baseLayers = {
        "OpenStreetMap": layerOSM
    };

    var overlays = {
        "Monuments": layerMonuments
    };

    L.control.layers(baseLayers, overlays).addTo(map);

    var osmGeocoder = new L.Control.OSMGeocoder();
    map.addControl(osmGeocoder);
    var hash = new L.Hash(map);

    // sidebar
    sidebar = L.control.sidebar('sidebar', {
        position: 'left',
        autoPan: false
    });
    map.addControl(sidebar);
    /*setTimeout(function () {
        sidebar.show();
    }, 500);*/
    sidebar.setContent('<h1>Wiki Loves Monuments</h1>' +
        '<p><img src="//upload.wikimedia.org/wikipedia/commons/thumb/f/f3/LUSITANA_WLM_2011_d.svg/70px-LUSITANA_WLM_2011_d.svg.png" align=right /><b>Welcome!</b> This is a map for the <a href="//commons.wikimedia.org/wiki/Commons:Wiki_Loves_Monuments_2014" target="_blank">Wiki Loves Monument 2014</a> (<a href="//www.wikilovesmonuments.org" target="_blank">blog</a>) photographic contest. Search monuments near to you, take photos and upload them!</p>' +
        '<h3>Legend</h3>' +
        '<table border=0 width=300px>' +
        '<tr><td><img src="icons/withimageicon.png" /></td><td>Monument with image</td>' +
        '<td><img src="icons/withoutimageicon.png" /></td><td>Monument without image</td></tr>' +
        '</table>' +
        '<h3>Statistics</h3>' +
        '<p>There are <a href="//tools.wmflabs.org/wlm-stats" target="_blank">statistics</a> to compare with previous editions.</p>' +
        '<iframe src="//tools.wmflabs.org/wlm-stats/stats-2014-mini.php" width=330px height=170px frameborder=0 scrolling=no style="margin-bottom: -20px;">Browser not compatible.</iframe>' +
        '<h3>See also</h3>' +
        '<ul style="margin-left: -20px;">' +
        '<li><a href="//tools.wmflabs.org/wmcounter/" target="_blank">wmcounter</a>: Wikimedia projects edits counter</li>' +
        '<li><a href="//tools.wmflabs.org/commons-coverage/" target="_blank">Commons Coverage</a>: 1 image/km<sup>2</sup>, we can do it!</li>' +
        '<li><a href="//en.wikipedia.org/wiki/Wikipedia:There_is_a_deadline" target="_blank">There is a deadline</a>: an essay on the importance of preserving knowledge</li>' +
        '<li><a href="//en.wikipedia.org/wiki/User:Emijrp/All_human_knowledge" target="_blank">User:Emijrp/All human knowledge</a> - estimating the number of articles needed to cover all knowledge</li>' +
        '</ul>' +
        ''
        );

    map.on('moveend', whenMapMoves);
    window.addEventListener('message', function (event) {
        console.log('got event', event);
        var parsed = JSON.parse(event.data);
        if (parsed != undefined && parsed.name != undefined && parsed.name === "imageChanged") {
            $('#mapillary_button').html('<button id="upload_button">Upload Mapillary image</button><a id="submit_button_link" href="" target="_blank"><button class="hidden" id="submit_button">Submit Mapillary image</button></a>');
            $('#upload_button').on('click', function () {
              var url = 'https://a.mapillary.com/v2/g/' + parsed.data.key+"?client_id=NzNRM2otQkR2SHJzaXJmNmdQWVQ0dzoxNjQ3MDY4ZTUxY2QzNGI2";
//                console.log('Image info url: ', url);
                $.ajax({
                    url: url,
                    dataType: 'json',
                    success: function (data) {
                        console.log('raw mapillary data', data);
                        var parseddata = data;
                        console.log('parsed mapillary data', parseddata);
                        console.log('nodes of parsed mapillary data', parseddata.nodes[0]);
                        while (parseddata.nodes[0].location == '') {
                            parseddata.nodes[0].location = prompt("Please enter a short description of the location", "");
                        }
//                        alert("parseddata.nodes[0].location = " + parseddata.nodes[0].location);
                        parseddata.nodes[0].key = parseddata.nodes[0].key.replace ( /_/g , "$US$" ) ;
                        var isoDate = new Date(parseddata.nodes[0].captured_at).toISOString().replace(/T/g, ' ').replace(/.000Z/g, '');
                        var uploadDescription = '{{subst:Mapillary' +
                            '|location=' + parseddata.nodes[0].location +
                            '|key=' + parseddata.nodes[0].key +
                            '|date=' + isoDate +
                            '|username=' + parseddata.nodes[0].username +
                            '|lat=' + parseddata.nodes[0].lat +
                            '|lon=' + parseddata.nodes[0].lon +
                            '|ca=' + parseddata.nodes[0].ca +
                            '}}';
                        var destFile = parseddata.nodes[0].location + ' - Mapillary (' + parseddata.nodes[0].key + ').jpg';
                        var imageurl = parseddata.nodes[0].image.replace('thumb-1024.jpg', 'thumb-2048.jpg');  //request larger size
                        var magnusurl = '//tools.wmflabs.org/url2commons/index.html?urls=' + imageurl + ' ' + destFile + '|' + encodeURIComponent(uploadDescription) + '&desc=$DESCRIPTOR$';
                        console.log('Ready to produce upload link');
                        $('#submit_button_link').attr("href", magnusurl);
                        $('#submit_button').html('Click link to upload as: <br /><font size="2">' + destFile + '</font>');
                        $('#upload_button').addClass('hidden');
                        $('#submit_button').removeClass('hidden');
//                        $('#upload_button').html('Uploaded directly as <br /><font size="2">' + destFile + '</font>');
                    },
                    error: function (jqxhr, textStatus, errorThrown) {
                        alert("The ajax call failed");
                        console.log(textStatus);
                        console.log(errorThrown);
                    }
                });
            });
        }
    }, false);

    askForMonuments();
}

function whenMapMoves(e) {
    askForMonuments();
}

function setMarker(feature, latlng) {
    var popuptext;
    popuptext = '<table border=0 width=300px>';
    if (feature.properties.monument_article) {
        popuptext += '<tr><td colspan=2><strong><a href="//' + feature.properties.lang + '.'+feature.properties.project+'.org/wiki/' + feature.properties.monument_article + '" target="_blank">' + feature.properties.name + '</a></strong></td></tr>';
    } else {
        popuptext += '<tr><td colspan=2><strong>' + feature.properties.name + '</strong></td></tr>';
    }
    var thumb_url = '//upload.wikimedia.org/wikipedia/commons/thumb/' + feature.properties.md5.substring(0, 1) + '/' + feature.properties.md5.substring(0, 2) + '/' + feature.properties.image + '/150px-' + feature.properties.image;
    popuptext += '<tr><td valign=top><b>ID:</b> ' + feature.properties.id + '<br/><b>Country:</b> ' + feature.properties.country + '</td><td><a href="//commons.wikimedia.org/wiki/File:' + feature.properties.image + '" target="_blank"><img src="' + thumb_url + '" /></a></td></tr>';
    popuptext += '<tr><td colspan=2 style="text-align: center;font-size: 150%;"><a href="//commons.wikimedia.org/w/index.php?title=Special:UploadWizard&campaign=wlm-' + feature.properties.country + '&id=' + feature.properties.id + '" target="_blank"><b>Upload your photo</b></a></td></tr>';
    var klass = 'mapillary_' + feature.properties.id
        .replace(/[<> \/-]/g, '_')
        .replace(/\)/g, '_')
        .replace(/\(/g, '_')
        .replace(/\}/g, '_')
        .replace(/'/g, '_');
//    console.log(feature.properties.id, klass);
    popuptext += '<tr><td colspan=2 style="text-align: center;font-size: 150%;"><button class="' + klass + '">Check Mapillary</button></td></tr>';
    popuptext += '<tr><td colspan=2 style="text-align: center;font-size: 150%;"><div id="mapillary_container"/></td></tr>';
    popuptext += '<tr><td colspan=2 style="text-align: center;font-size: 150%;"><div id="' + klass + '"></div></td></tr>';
    if (feature.properties.commonscat) {
        popuptext += '<tr><td colspan=2 style="text-align: center;">(<a href="//commons.wikimedia.org/wiki/Category:' + feature.properties.commonscat + '" target="_blank">More images in Commons</a>)</td></tr>';
    }
    popuptext += '</table>';

//    popuptext += link;

    var icon;
    if (feature.properties.image != 'Monument_unknown.png') {
        icon = withimageicon;
    } else {
        icon = withoutimageicon;
    }
    var monument;
    monument = L.marker(latlng, {icon: icon});
    monument.bindPopup(popuptext, {minWidth: 300});
    $('#mapdiv').on('click', '.' + klass,  function (event) {
        event.stopPropagation();
        console.log('event.currentTarget', event);
        var url = 'https://mapillary-read-api.herokuapp.com/v1/im/close' +
            '?lat=' + feature.geometry.coordinates[1] +
            '&lon=' + feature.geometry.coordinates[0] +
            '&distance=100&limit=1';
//        console.log('mapillary request', url);
        $('#' + klass).html('<div class="loading overlay">Loading ...</div>');
        $.ajax({
            url: url,
            dataType: 'json',
            success: function (data) {
//                console.log('mapillary data', data[0]);
                if (data.length == 0) {
                    $('#mapillary_container').html('No images here. Take some with your phone, see <a href="http://www.mapillary.com" target="_blank">Mapillary</a>');
                } else {
                    $('#mapillary_container').html('<div id="mapillary_button"></div><iframe height="300px" src="//www.mapillary.com/jsapi?showMap=false&showImage=true&image=' + data[0].key + '"/>');
                }
                $('#' + klass).html('');
            }
        });
    });
    return monument;
}

function askForMonuments() {
    var mobile;
    mobile = '0';
    if ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || (window.innerWidth <= 800 && window.innerHeight <= 600) ) {
        mobile = '1';
    }
    var data = 'bbox=' + map.getBounds().toBBoxString() + '&mobile=' + mobile;
    document.getElementById('wait').style.display = 'block';
    $.ajax({
        url: 'ajaxmonuments.php',
        dataType: 'json',
        data: data,
        success: showMonuments
    });
}

function showMonuments(ajaxresponse) {
    layerMonuments.clearLayers();
    layerMonuments.addData(ajaxresponse);
    document.getElementById('wait').style.display = 'none';
}
