/**
 * Created by mkahn on 4/28/15.
 */

app.controller( "scrollerController",
    function ( $scope, $timeout, $http, $interval, optvModel, $log, $window ) {

        console.log( "Loading scrollerController" );


        $scope.messageArray = [ "Golden State pushes series to decisive Game 7",
            "Try our new Ranch Chicken Salad, $7.99",
            "Don't forget our 4th of July Party!",
            "Try Rheingold IPA, Hop to It",
            "Bangers and Mash on Special for Happy Hour" ];

        function logLead() { return "scrollerController: "; }

        function modelUpdate( data ) {

            $log.debug( logLead() + " got a model update: " + angular.toJson( data ) );
            if ( data.messages ) {
                $scope.messageArray = data.messages;
            }


        }

        function inboundMessage( msg ) {
            $log.debug( logLead() + "Inbound message..." );
        }

        function updateFromRemote() {

            optvModel.init( {
                appName:         "io.overplay.pubcrawler",
                endpoint:        "tv",
                dataCallback:    modelUpdate,
                messageCallback: inboundMessage,
                initialValue:    { messages: $scope.messageArray }
            } );

        }

        $scope.$watch( function () {
            return $window.innerWidth;
        }, function ( value ) {
            console.log( value );
            $scope.screen = { width: $window.innerWidth, height: $window.innerHeight };
        } );

        $scope.logo = "assets/img/brand.png";

        updateFromRemote();


    } );


app.directive( 'leftScroller2t', [
    '$log', '$timeout', '$window',
    function ( $log, $timeout, $window ) {
        return {
            restrict:    'E',
            scope:       {
                messageArray: '=',
                logo:         '='
            },
            templateUrl: 'app/components/scroller/leftscroller2.template.html',
            link:        function ( scope, elem, attrs ) {

                scope.leftPos = { left: '200px' };

                scope.screen = { width: $window.innerWidth, height: $window.innerHeight };

                var scrollerUl = document.getElementById( 'scroller-ul' );

                scrollerUl.addEventListener( "transitionend", function () {

                    doScroll();

                }, false );

                function doScroll() {

                    $timeout( function () {
                        var width = scrollerUl.offsetWidth;
                        $log.debug( "Scroller width: " + width );
                        scope.leftPos = {
                            '-webkit-transform': 'translate(' + (width - 400) + 'px,0)',
                            transition:          '-webkit-transform 0s'
                        };
                        var destXform = -width + 'px';
                        $timeout( function () {
                            scope.leftPos = {
                                '-webkit-transform': 'translate(' + destXform + ',0)',
                                transition:          '-webkit-transform 30s linear'
                            };

                        }, 100 );
                    }, 100 );

                }

                doScroll();

            }
        }
    } ]
);

app.directive( 'leftScroller2', [
    '$log', '$timeout', '$window',
    function ( $log, $timeout, $window ) {
        return {
            restrict:    'E',
            scope:       {
                messageArray: '=',
                logo:         '='
            },
            templateUrl: 'app/components/scroller/leftscroller2.template.html',
            link:        function ( scope, elem, attrs ) {

                scope.leftPos = { left: '1280px' };

                scope.ui = {
                    scrollin:  false,
                    scrollout: false,
                    nextUpArr: [ "1:00 Giants vs. DBacks", "4:30 GSW Pregame", "5:00 Warriors v Cavs" ],
                    nextUp:    '',
                    nidx:      0
                };

                $timeout( function () { }, 5000 );

                var scrollerWidth;
                var currentLeft = 1280;
                var FPS = 480;
                var PPF = 0.5;

                function scroll() {

                    scope.ui.nextUp = '';
                    scope.ui.scrollin = false;

                    $timeout( function () {

                        scope.ui.nextUp = scope.ui.nextUpArr[ scope.ui.nidx ];
                        scope.ui.nidx++;
                        if ( scope.ui.nidx == scope.ui.nextUpArr.length )
                            scope.ui.nidx = 0;
                        scope.ui.scrollin = true;

                        $timeout( function () {
                            scope.ui.scrollin = false;
                            $timeout( scroll, 250 );
                        }, 5000 )


                    }, 250 )
                }

                scroll();

                scope.screen = { width: $window.innerWidth, height: $window.innerHeight };

                var scrollerUl = document.getElementById( 'scroller-ul' );

                scrollerUl.addEventListener( "transitionend", function () {

                    doScroll();

                }, false );

                function loadWidth() {

                    return $timeout( function () {
                        return scrollerUl.offsetWidth;
                    } )

                }

                function assignLeft() {
                    scope.leftPos.left = currentLeft + "px";
                }

                function renderNext() {

                    assignLeft();
                    currentLeft = currentLeft - PPF;
                    if ( currentLeft < -scrollerWidth )
                        doScroll();
                    else
                        $timeout( renderNext, 1000 / FPS );


                }

                function doScroll() {

                    loadWidth()
                        .then( function ( width ) {
                            $log.debug( "Scroller width: " + width );
                            scrollerWidth = width;
                            currentLeft = 1280;
                            renderNext();
                        } );

                }

                doScroll();

            }
        }
    } ]
);
