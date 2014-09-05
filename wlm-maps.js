/*
 * Original code: https://github.com/chillly/plaques/blob/master/example3.js
 * 
 * Created by Chris Hill <osm@raggedred.net> and contributors.
 * Adapted for Wiki Loves Monuments by Emijrp <emijrp@gmail.com>
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
var fmis_withimageicon;
var fmis_withoutimageicon;
var bbr_withimageicon;
var bbr_withoutimageicon;
var arbetsl_withimageicon;
var arbetsl_withoutimageicon;

$(document).ready(init);

function init() {
    var osmUrl='//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';    
    var osmAttrib='Map data &copy; <a href="//openstreetmap.org" target="_blank">OpenStreetMap</a> contributors | <a href="https://commons.wikimedia.org/wiki/Commons:Monuments_database" target="_blank">Monuments database</a> by Wikipedia editors | <a href="https://github.com/emijrp/wlm-maps" target="_blank">Source code</a> by <a href="https://en.wikipedia.org/wiki/User:Emijrp">emijrp</a> in GitHub';
    
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
    
    bbr_withimageicon = L.icon({
        iconUrl: 'icons/BBRwithimageicon.png',
        iconSize: [32, 32],
        iconAnchor: [16, 31],
        popupAnchor: [0, -16]
    });
    
    bbr_withoutimageicon = L.icon({
        iconUrl: 'icons/BBRwithoutimageicon.png',
        iconSize: [32, 32],
        iconAnchor: [16, 31],
        popupAnchor: [0, -16]
    });
    
    fmis_withimageicon = L.icon({
        iconUrl: 'icons/FMISwithimageicon.png',
        iconSize: [32, 32],
        iconAnchor: [16, 31],
        popupAnchor: [0, -16]
    });
    
    fmis_withoutimageicon = L.icon({
        iconUrl: 'icons/FMISwithoutimageicon.png',
        iconSize: [32, 32],
        iconAnchor: [16, 31],
        popupAnchor: [0, -16]
    });
    
    arbetsl_withimageicon = L.icon({
        iconUrl: 'icons/Museumwithimageicon.png',
        iconSize: [32, 32],
        iconAnchor: [16, 31],
        popupAnchor: [0, -16]
    });
    
    arbetsl_withoutimageicon = L.icon({
        iconUrl: 'icons/Museumwithoutimageicon.png',
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
        pointToLayer: setMarker,
        }
    );
    var start = new L.LatLng(63.5, 16.9);
    
    // create the map
    map = new L.Map('mapdiv', {
        center: start,
        zoom: 5,
        layers: [layerOSM,layerMonuments]
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
        autoPan: false,
    });
    map.addControl(sidebar);
    /*setTimeout(function () {
        sidebar.show();
    }, 500);*/
    sidebar.setContent('<h1>Wiki Loves Monuments</h1>' +
        '<p><b>Välkommen!</b> Detta är en karta för den fotografiska tävlingen <a href="https://commons.wikimedia.org/wiki/Commons:Wiki_Loves_Monuments_2014">Wiki Loves Monument 2014</a> (<a href="http://www.wikilovesmonuments.se">blogg</a>). Hitta kulturminnen i din närhet, ta fotografier och ladda upp dem!</p>' +
        '<h3>Kartnyckel</h3>' +
        '<table border=0 width=300px>' +
        '<tr><td><img src="icons/withimageicon.png" /></td><td>Kulturminne med bild</td>' +
        '<td><img src="icons/withoutimageicon.png" /></td><td>Kulturminne utan bild</td></tr>' +
        '</table>' +
        '<h3>Se även</h3>' +
        '<ul style="margin-left: -20px;">' +
        '<li><a href="//tools.wmflabs.org/wlm-maps/">wlm-maps</a>: Originalkartan med alla objekt som ingår internationellt</li>' +
        '<li><a href="//tools.wmflabs.org/wlm-stats">wlm-stats</a>: Statistik för årets tävling.</li>' +
        '</ul>' +
        ''
        );
    
    map.on('moveend', whenMapMoves);
    askForMonuments();
}

function whenMapMoves(e) {
    askForMonuments();
}

function setMarker(feature,latlng) {
    var popuptext;
    popuptext = '<table border=0 width=300px>';
    if (feature.properties.monument_article)
    {
        popuptext = popuptext + '<tr><td colspan=2><strong><a href="https://'+feature.properties.lang+'.wikipedia.org/wiki/'+feature.properties.monument_article+'" target="_blank">'+feature.properties.name+'</a></strong></td></tr>';
    }else{
        popuptext = popuptext + '<tr><td colspan=2><strong>'+feature.properties.name+'</strong></td></tr>';
    }
    var thumb_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/' + feature.properties.md5.substring(0,1) + '/' + feature.properties.md5.substring(0,2) + '/' + feature.properties.image + '/150px-' + feature.properties.image;
    popuptext = popuptext + '<tr><td valign=top><b>ID:</b> '+feature.properties.id+'<br/><b>Typ:</b> ';
    if (feature.properties.country == 'se-fornmin')
    {
        popuptext = popuptext + 'Fornlämning';
    }else if (feature.properties.country == 'se-bbr')
    {
        popuptext = popuptext + 'Byggnadsminne';
    }else if (feature.properties.country == 'se-arbetsl')
    {
        popuptext = popuptext + 'Arbetslivsmuseum';
    }else{
        popuptext = popuptext + feature.properties.country.substring(3, 10);
    }
    popuptext = popuptext +'</td><td><a href="https://commons.wikimedia.org/wiki/File:'+feature.properties.image+'" target="_blank"><img src="'+thumb_url+'" /></a></td></tr>';
    popuptext = popuptext + '<tr><td colspan=2 style="text-align: center;font-size: 150%;"><a href="https://commons.wikimedia.org/w/index.php?title=Special:UploadWizard&campaign=wlm-'+feature.properties.country+'&id='+feature.properties.id+'&lat='+feature.geometry.coordinates[0]+'&lon='+feature.geometry.coordinates[1]+'" target="_blank"><b>Ladda upp din bild!</b></a></td></tr>';
    if (feature.properties.commonscat)
    {
        popuptext = popuptext + '<tr><td colspan=2 style="text-align: center;">(<a href="https://commons.wikimedia.org/wiki/Category:'+feature.properties.commonscat+'" target="_blank">Fler bilder på Commons</a>)</td></tr>';
    }
    popuptext = popuptext + '</table>';
    var icon;
    if (feature.properties.image != 'Monument_unknown.png')
    {
        if (feature.properties.country == 'se-fornmin')
        {
            icon = fmis_withimageicon;
        }else if (feature.properties.country == 'se-bbr')
        {
            icon = bbr_withimageicon;
        }else if (feature.properties.country == 'se-arbetsl')
        {
            icon = arbetsl_withimageicon;
        }else{
            icon = withimageicon;
        }
    }else{
        if (feature.properties.country == 'se-fornmin')
        {
            icon = fmis_withoutimageicon;
        }else if (feature.properties.country == 'se-bbr')
        {
            icon = bbr_withoutimageicon;
        }else if (feature.properties.country == 'se-arbetsl')
        {
            icon = arbetsl_withoutimageicon;
        }else{
            icon = withoutimageicon;
        }
    }
    var monument; 
    monument=L.marker(latlng, {icon: icon});
    monument.bindPopup(popuptext, {minWidth: 300});
    return monument;
}

function askForMonuments() {
    var mobile;
    mobile = '0';
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || (window.innerWidth <= 800 && window.innerHeight <= 600) ) {
        mobile = '1';
    }
    var data='bbox=' + map.getBounds().toBBoxString() + '&mobile=' + mobile;
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
