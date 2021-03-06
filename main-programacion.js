$(document).ready(function () {
    $('.tecnioo-card-tecnico').each(function (i, v) {
        var x = $(this).attr('href'),
            y = $('#FechaAsignacion').val(),
            concatenado = '&fechaAsignacion=';
        $(this).attr('href', x + concatenado + y);
    });

});

var today = moment();
var yesterday = moment(today).add(-1, 'days');

$("#FechaAsignacion").datetimepicker({
    useCurrent: false,
    minDate: yesterday,
    defaultDate: moment(today).add(1, 'days'),
    //maxDate: moment(),
    //viewMode: 'years',
    locale: "es",
    format: 'L',
    showClose: true,
    showClear: true,
    toolbarPlacement: 'top'
});



// Initialize and add the map
var myLatlng;
var map;
var infowindow;
var marker = [];
var markerSinAsignar = [];
var markerAsignados = [];

function initMap() {
    myLatlng = new google.maps.LatLng(-33.4041299, -70.657178); //Centrado en sucursal santiago
    map = new google.maps.Map(
        document.getElementById('map'), { zoom: 8, center: myLatlng });
    //var fecha = $("#FechaAsignacion").val();

    $.ajax({
        type: 'GET',
        contentType: "application/json; charset=utf-8",
        url: '/Admin/GestionLlamados/jsonPuntosAsignar',
        //data: {"rutCliente": rutCliente },
        dataType: "json",
        beforeSend: function () {
            //alert(id);
        },
        success: function (data) {
            var positions = [];
            $.each(data, function (i, data) {
                positions.push({
                    lat: data.Latitud,
                    lng: data.Longitud,
                    title: data.NombreLocalCS,
                    direccion: data.DireccionCS,
                    idLlamado: data.IdLlamado
                });

            });
            var infowindow = new google.maps.InfoWindow();
            var latlngbounds = new google.maps.LatLngBounds();

            for (var i = 0; i < positions.length; i++) {
                myLatlng = new google.maps.LatLng(positions[i].lat, positions[i].lng);
                latlngbounds.extend(myLatlng);
                marker = new google.maps.Marker({
                    position: myLatlng,
                    map: map,
                    title: positions[i].title,
                    animation: google.maps.Animation.DROP,
                    idCall: positions[i].idLlamado
                });
                markerSinAsignar.push(marker);
                google.maps.event.addListener(marker, 'click', (function (marker, i) {
                    return function () {
                        var symbol = this.getIcon();
                        if (symbol === undefined) {
                            this.setIcon(pinSymbol('blue'));
                        } else {
                            if (symbol.fillColor === 'blue') {
                                this.setIcon('https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi2.png');
                            } else {
                                this.setIcon(pinSymbol('blue'));
                            }
                        }
                        var myId = this.idCall,
                        counter = 0;

                        $('.tecnioo-card').each(function (i, v) {
                            var checkData = $(this).find('.custom-checkbox input').data('id'),
                            checkDataPts = $(this).find('.custom-checkbox input').data('pts');
                            console.log(checkData);
                            console.log(checkDataPts);

                            if (checkData === myId) {
                                $(this).toggleClass('llamadoMarkerActivo');
                                
                                var chequeadoAnterior = $(this).find('input[type="checkbox"]').prop('checked');

                                if (chequeadoAnterior) {
                                    //var resta = (this).find('input[type="checkbox"]');
                                    $(this).find('input[type="checkbox"]').prop('checked', false);
                                    if (counter > 0){
                                        counter -= checkDataPts;
                                    }
                                } else {
                                    $(this).find('input[type="checkbox"]').prop('checked', true);
                                    $(this).parent().prepend($(this));
                                    counter += checkDataPts;
                                }
                            }

                        });
                        console.log(counter);
                        infowindow.setContent('#' + positions[i].idLlamado + ' ' + positions[i].direccion);
                        infowindow.open(map, marker);
                    }
                })(marker, i));

                $('.custom-checkbox input[type="checkbox"]').click(function(){

                });
            }

        },
        error: function (result) {
            alert('Falló el servicio de puntos: ' + result.status + ' Tipo :' + result.statusText);
        }
    });

    $.ajax({
        type: 'GET',
        contentType: "application/json; charset=utf-8",
        url: '/Admin/GestionLlamados/jsonPuntosAsignados',
        //data: {"fechaProgramacion": fecha },
        dataType: "json",
        beforeSend: function () {
            //alert(id);
        },
        success: function (data) {
            var positions = [];
            $.each(data, function (i, data) {
                positions.push({
                    lat: data.Latitud,
                    lng: data.Longitud,
                    title: data.NombreLocalCS,
                    direccion: data.DireccionCS,
                    idLlamado: data.IdLlamado,
                    idTecnico: data.IdTecnicoAsignado,
                    nombreTecnico: data.NombreTecnico
                });

            });
            var infowindow = new google.maps.InfoWindow();
            var latlngbounds = new google.maps.LatLngBounds();

            for (var i = 0; i < positions.length; i++) {
                myLatlng = new google.maps.LatLng(positions[i].lat, positions[i].lng);
                latlngbounds.extend(myLatlng);
                marker = new google.maps.Marker({
                    position: myLatlng,
                    map: map,
                    title: positions[i].title,
                    icon: {
                        url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
                    },
                    label: positions[i].nombreTecnico,
                    animation: google.maps.Animation.DROP
                });
                markerAsignados.push(marker);
                google.maps.event.addListener(marker, 'click', (function (marker, i) {
                    return function () {
                        console.log($(this).data('id'))
                        infowindow.setContent('#' + positions[i].idLlamado + ' ' + positions[i].direccion);
                        infowindow.open(map, marker);
                    }
                })(marker, i));
            }

        },
        error: function (result) {
            alert('Falló el servicio de puntos: ' + result.status + ' Tipo :' + result.statusText);
        }
    });

}

function pinSymbol(color) {
    return {
        path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z M -2,-30 a 2,2 0 1,1 4,0 2,2 0 1,1 -4,0',
        fillColor: color,
        fillOpacity: 1,
        strokeColor: '#000',
        strokeWeight: 2,
        scale: 1
    };
}

$('#FechaAsignacion').on('dp.change', function (e) {
    var fecha = e.date.format('DD/MM/YYYY');
    for (var i = 0; i < markerAsignados.length; i++) {
        markerAsignados[i].setMap(null);
    }

    $('.tecnioo-card-tecnico').each(function (i, v) {
        var x = $(this).attr('href'),
            indice = x.indexOf("&"),
            xCortado = x.substr(0, indice),
            concatenado = '&fechaAsignacion=';
        $(this).attr('href', xCortado + concatenado + fecha);
    });

    markerAsignados = [];
    $.ajax({
        type: 'GET',
        contentType: "application/json; charset=utf-8",
        url: '/Admin/GestionLlamados/jsonPuntosAsignados',
        data: { "fechaProgramacion": fecha },
        dataType: "json",
        beforeSend: function () {
            //alert(id);
        },
        success: function (data) {
            var positions = [];
            $.each(data, function (i, data) {
                positions.push({
                    lat: data.Latitud,
                    lng: data.Longitud,
                    title: data.NombreLocalCS,
                    direccion: data.DireccionCS,
                    idLlamado: data.IdLlamado,
                    idTecnico: data.IdTecnicoAsignado,
                    nombreTecnico: data.NombreTecnico
                });

            });
            var infowindow = new google.maps.InfoWindow();
            var latlngbounds = new google.maps.LatLngBounds();

            for (var i = 0; i < positions.length; i++) {
                myLatlng = new google.maps.LatLng(positions[i].lat, positions[i].lng);
                latlngbounds.extend(myLatlng);
                marker = new google.maps.Marker({
                    position: myLatlng,
                    map: map,
                    title: positions[i].title,
                    icon: {
                        url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
                    },
                    label: positions[i].nombreTecnico,
                    animation: google.maps.Animation.DROP
                });
                markerAsignados.push(marker);
                google.maps.event.addListener(marker, 'click', (function (marker, i) {
                    return function () {
                        console.log($(this).data('id'))
                        infowindow.setContent('#' + positions[i].idLlamado + ' ' + positions[i].direccion);
                        infowindow.open(map, marker);
                    }
                })(marker, i));
            }

        },
        error: function (result) {
            alert('Falló el servicio de puntos: ' + result.status + ' Tipo :' + result.statusText);
        }
    });

    $.ajax({
        type: 'GET',
        contentType: "application/json; charset=utf-8",
        url: '/Admin/GestionLlamados/jsonInfoTecPorFecha',
        data: { "fechaProgramacion": fecha },
        dataType: "json",
        beforeSend: function () {
            //alert(id);
        },
        success: function (data) {

            $.each(data, function (i, data) {
                var nuevoWidth = 'width: ' + data.Porcentaje + '%';
                $('#IdTecnico_' + data.IdTecnico).attr('style', nuevoWidth);
                $('#cantOtTec_' + data.IdTecnico).text(data.CantOT + ' Tickets');
                $('#CantPtsTec_' + data.IdTecnico).text(data.CantPuntos + ' pts');
            });


        },
        error: function (result) {
            alert('Falló el servicio de actualizacion info tecnicos: ' + result.status + ' Tipo :' + result.statusText);
        }
    });

});
