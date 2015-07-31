(function ( $ ) {

    var canvasID; // ID of recognizer Canvas
    var dictContainer; // results container ID
    var canvas; //Handwriting Canvas DOM element
    var context; // Canvas Context
    var strokeCount = 0;
    var strokeOrder =   []; // array of stroke points in order
    var radicalCount = 0;
    var searchString = '';
    var matchRange    =   2;
    var strokeDirections    =   []; // array of stroke angle in degrees in (0,0) axis
    var searchTextId =   'searchText';
    var dictCharId  =   'dictchar';
    var clearButtonId   =   'clear';
    var btnSearchId =   'btnSearch';
    
    var lookupDictType  =   'simplified'; // type of look up dictionary (Traditional /Simplified)
    
        
    var debug   =   true; // display debug information, for development only
    
    var resultsPerRow   =   5; // number of chars per rows displayed on match results

    var prevPoint; // previous draw point position
    var strokeLines; // array of points on stroke lines
    

    //setup handwriting recognizer
    this.init   =   function (settings) {
        
        if (debug)
            console.log('Handwriting recognizer init..');
        
        canvasID    =    settings.canvasID;
        dictContainer  =   settings.resultsDiv;
        resultsPerRow   =   settings.resultsPerRow;
        searchTextId    =   settings.searchTextId;
        dictCharId   =  settings.dictCharId;
        lookupDictType  =   settings.dictType;
        btnSearchId =   settings.btnSearchId;
        
        
        
        canvas = document.getElementById(canvasID);
       
        if (typeof(canvas) =='undefined') 
            return false;
        
        canvas.width = settings.width;
        canvas.height = settings.height;

        context = canvas.getContext('2d');
        

        colors = ['rgba(255,0,0,0.5)',
            'rgba(0,255,0,0.5)',
            'rgba(0,0,255,0.5)',
            'rgba(200,200,0,0.5)',
        ];
        
       
        drawAxisLines();
        
        addMouseSupport();
        
        addTouchSupport();
        
        addButtonsControler();
        
    }
    
    this.addButtonsControler    =   function() {
        
    //add selected char to Search field
        $('#'+dictContainer).on('click touchend', "[data-button='" + dictCharId + "']", function(e) {
            e.preventDefault();
            searchString += $(this).html();
            $('#'+searchTextId).val(searchString);
        });


        //do Search
        $('#'+ btnSearchId).on('click touchstart', function() {
            $('#'+searchTextId).val('');
            searchString        =   '';
            clearStrokes();
        });
        
        


        //dictionary type changed
        $("input[type=radio][name=dict]").on('change', function() {
            lookupDictType  =  $('#dict:checked').val(); 
            showResults();
        });

        //Clear Canvas Content
        $('#'+ clearButtonId).click(function() {
            clearStrokes();
            showCounter();

        })

    }

    this.resetResults   =   function() {
        //clear previous recogination data
        $('#'+dictContainer).html('');

    }
    //BOF: STROKES DRAWING
    this.startStroke	=	function() {

    }

    this.drawStroke	=	function() {

    }

    this.stopStroke	=	function() {


    }


    //EOF: STROKES DRAWING
    
    this.addTouchSupport  =    function(){
        //BOF: TOUCH SUPPORT
        var mc = new Hammer.Manager(canvas);
        var swipe = new Hammer.Swipe({direction: Hammer.DIRECTION_ALL, threshold: 50, velocity: 2});
        mc.add(swipe);

        // handle swipe event
        mc.on('swipe', function () {

            clearStrokes();

        });


        //EOF:  TOUCH SUsPPORT
    }
    


    this.addMouseSupport    =   function () {
        
        $(canvas).on('mouseout touchleave', function(e) {
        	console.log('Mouse OUt...');

        	//context.closePath();
            //$(canvas).unbind('mousemove touchmove').unbind('mouseup touchup');

        });

        // Mouse Down/ Touch Down
        $(canvas).on('mousedown touchend', function(e) {
            prevPoint = getpos(e)
            strokeLines = [prevPoint]


            $(canvas).on('mousemove touchmove', function(e) {
                pos = getpos(e)

                context.beginPath();
                context.lineWidth = 5;
                context.moveTo(prevPoint.x, prevPoint.y);
                context.lineTo(pos.x, pos.y);
                context.stroke();

                prevPoint = pos
                strokeLines.push(pos)

            })

            context.strokeStyle = "rgba(0,0,0,0.2)"

            //Stroke ENDED 
            $(canvas).on('mouseup touchup', function() {

                context.closePath();
                $(canvas).unbind('mousemove touchmove').unbind('mouseup touchup');
                corners = [strokeLines[0]];

                var n = 0
                var t = 0
                var lastCorner = strokeLines[0]
                for (var i = 1; i < strokeLines.length - 2; i++) {

                    var pt = strokeLines[i + 1]
                    var d = delta(lastCorner, strokeLines[i - 1])

                    if (len(d) > 20 && n > 2) {
                        ac = delta(strokeLines[i - 1], pt)
                        if (Math.abs(angle_between(ac, d)) > Math.PI / 4) {
                            pt.index = i
                            corners.push(pt)
                            lastCorner = pt
                            n = 0
                            t = 0
                        }
                    }
                    n++
                }

                if (len(delta(strokeLines[strokeLines.length - 1], strokeLines[0])) < 25) {
                    corners.push(strokeLines[0])

                    context.fillStyle = 'rgba(0, 0, 255, 0.3)'

                    if (corners.length == 5) {
                        //check for square
                        var p1 = corners[0]
                        var p2 = corners[1]
                        var p3 = corners[2]
                        var p4 = corners[3]
                        var p1p2 = delta(p1, p2)
                        var p2p3 = delta(p2, p3)
                        var p3p4 = delta(p3, p4)
                        var p4p1 = delta(p4, p1)
                        if ((Math.abs(angle_between(p1p2, p2p3) - Math.PI / 2)) < Math.PI / 6
                                && (Math.abs(angle_between(p2p3, p3p4) - Math.PI / 2)) < Math.PI / 6
                                && (Math.abs(angle_between(p3p4, p4p1) - Math.PI / 2)) < Math.PI / 6
                                && (Math.abs(angle_between(p4p1, p1p2) - Math.PI / 2)) < Math.PI / 6) {
                            context.fillStyle = 'rgba(0, 255, 255, 0.3)'
                            var p1p3 = delta(p1, p3)
                            var p2p4 = delta(p2, p4)

                            var diag = (len(p1p3) + len(p2p4)) / 4.0

                            var tocenter1 = scale(unit(p1p3), -diag)
                            var tocenter2 = scale(unit(p2p4), -diag)

                            var center = average([p1, p2, p3, p4])

                            var angle = angle_between(p1p3, p2p4)

                            corners = [add(center, tocenter1),
                                add(center, tocenter2),
                                add(center, scale(tocenter1, -1)),
                                add(center, scale(tocenter2, -1)),
                                add(center, tocenter1)]
                        }


                    }

                    context.lineWidth = 1;

                    context.beginPath()
                    context.moveTo(corners[0].x, corners[0].y)
                    for (var i = 1; i < corners.length; i++) {
                        context.lineTo(corners[i].x, corners[i].y)
                    }
                    context.fill()

                } else {

                    corners.push(strokeLines[strokeLines.length - 1])
                }

                //do not process if  just only one point
                if (corners.length == 2 && corners[0] == corners[1])
                    return;


                if (debug) {
                    //draw stroke lines
                    context.lineWidth = 1;
                    context.strokeStyle = 'rgba(0, 0, 255, 0.5)'
                    context.beginPath()
                    context.moveTo(corners[0].x, corners[0].y)
                    for (var i = 1; i < corners.length; i++) {
                        context.lineTo(corners[i].x, corners[i].y)
                    }
                    context.stroke()


                    context.fillStyle = 'rgba(255, 0, 0, 0.5)'
                    for (var i = 0; i < corners.length; i++) {
                        context.beginPath()
                        context.arc(corners[i].x, corners[i].y, 4, 0, 2 * Math.PI, false)
                        context.fill()
                    }
                }

                //count when new stroke draw ended


                strokeDirections[strokeCount] = getStrokeDirections(corners);
                strokeOrder[strokeCount] = corners.length;

                strokeCount++;
                showCounter();

                showResults();

     //           console.log(strokeDirections);

            })

        })
    
    }
        
    
    
    function getpos(e) {
        var offset = $(canvas).offset()
        return {
            x: e.pageX - offset.left,
            y: e.pageY - offset.top,
        }
    }

    function getTouchPos(e) {
    	var offset	=	$(canvas).offset;

    	return {
    		x: e.pageX - offset.left,
            y: e.pageY - offset.top,
    	}


    }

    function vector(x, y) {
        return {
            x: x,
            y: y,
        }
    }

    function delta(a, b) {
        return vector(a.x - b.x, a.y - b.y)
    }

    function angle_between(a, b) {
        return Math.acos((a.x * b.x + a.y * b.y) / (len(a) * len(b)))
    }

    function len(v) {
        return Math.sqrt(v.x * v.x + v.y * v.y)
    }

    function unit(c) {
        var l = len(c)
        return vector(c.x / len(c), c.y / len(c))
    }

    function scale(c, f) {
        return vector(c.x * f, c.y * f)
    }

    function add(a, b) {
        return vector(a.x + b.x, a.y + b.y)
    }

    function rotate(v, a) {
        return vector(v.x * Math.cos(a) - v.y * Math.sin(a),
                v.x * Math.sin(a) + v.y * Math.cos(a))
    }

    function average(l) {
        var x = 0
        var y = 0
        for (var i = 0; i < l.length; i++) {
            x += l[i].x;
            y += l[i].y
        }
        return vector(x / l.length, y / l.length)
    }


    function getDirection(p1, p2) {
       
       var checkAngle   =   angle(p1, p2);
       
       console.log('Stroke angle:' +checkAngle + 'o');
       
       var vangle  =  Math.abs(checkAngle);
       var direction  = {};

        direction['d2'] =   getDirectionByName(vangle);
        
        if (p1.x < p2.x) {
            direction['d1'] = 0; // left to right
        } else {
            direction['d1'] = 1; // right to left
        }

        //stroke angle in degree
       direction['a']    =   checkAngle;

       return direction;
    }
    
    //angle between two point in degrees
    function angle(p1,p2) {
        var xDiff = p2.x - p1.x;
        var yDiff = p2.y - p1.y; 
        var dangle =   Math.atan2(yDiff, xDiff) * (180 / Math.PI);
        return dangle; 
    } 


    
    // draw Axis Lines
    function drawAxisLines() {
      context.setLineDash([1,5]);      

      context.beginPath();
      context.moveTo(canvas.width/2, 0);
      context.lineTo(canvas.width/2, canvas.height);
      context.stroke();
      
      context.beginPath();
      context.moveTo(0, canvas.height/2);
      context.lineTo(canvas.width, canvas.height/2);
      context.stroke();
      
      context.setLineDash([3,0]);      
      
    }


    // get stroke directions
    function getStrokeDirections(strokePoints) {
        
        var strokePointLength   =   strokePoints.length;
        var firstPoint  =   strokePoints[0];
        var lastPoint   =   strokePoints[strokePointLength-1];

        var directions  =   {};
        
        directions  =   getDirection(firstPoint, lastPoint);
        // direction D2 = d() if the stroke have more than two lines(>3 points)
        if (strokePointLength > 2)
            directions['d2'] = 'd';
        
        return directions;

    }
    
    // return direction by Symbol
    function getDirectionByName(angle) {
        angle   =    Math.abs(angle);
        
        if (angle>75 && angle <105) {
            return 'h';
        } else if (angle<25 || angle>165) {
            return 'v';
        } else {
            return 'd';
        }
    }
    


    // get match chars bystroke order
    function getMatchChars(dictData) {
       
        var matchData   =   [];
        var isMatch =   true;

        $.each(dictData, function(index, data) {
            isMatch =   true;
            
            for (var i=0; i<strokeCount; i++) {
                
              isMatch   = strokePointsMatch(strokeOrder[i],data.strokeOrder[i] );
                // add new filer here like bellow case
                if (isMatch)
                  isMatch = directionFilter(strokeDirections[i], data.directions[i]);              
              
              if(isMatch) {
                    // process stroke points match
                    data.strokeOrder[i].matchPercent = Math.abs(strokeOrder[i] - data.strokeOrder[i]);
                   // add any good Recognition Filter here
               } else {
                   isMatch  =   false;
                   break;
               }               
            }
            
            if (isMatch)
                matchData.push(data);

        });
        
        
        if (matchData.length > 0)
            matchData.sort(matchCompare);
        
   //     console.log(matchData);
        
        
        return matchData;
    }

    
    //BOF: Stroke Filters 
    

    //filter by number of points/lines per a stroke    
    function strokePointsMatch(strokePoints, dataPoints) {
         if ( Math.abs(strokePoints - dataPoints) <= matchRange    ) {
             return true;
         } else {
             return false;
         }
    }
    
    
    //filter by direction    
    //@param data : dictionary Data
    function directionFilter(strokeDirection, dataDirection) {
        var isMatch = false;

        isMatch =  ( (strokeDirection.d2=='d' || strokeDirection.d2=='h') && (dataDirection.d2=='d' || dataDirection.d2=='h' ) ) || (strokeDirection.d2 == dataDirection.d2);
        
        if (isMatch) {
            //horizontal /vertical direction
            if (dataDirection['d2']=='d' ) { // Diagonal
               isMatch = (strokeDirection['d1'] == dataDirection['d1']); // must have same Diagonal direction
            }
        } 
            
      return isMatch;
    }
    //EOF: Stroke Filters
    
    
    //BOF: MATCH SORT FILTERS
    function matchCompare(a, b) {

        // sort by strokeCount , ASC
        if (a.strokeCount < b.strokeCount) {
            return -1;
        } else if (a.strokeCount > b.strokeCount) {
            return 1;
        }
        
    //sort by direction     
     for (var i=0; i<strokeCount; i++) {
         // horizontal/ vertical first
         if ( (strokeDirections[i].d2 == a.directions[i].d2 && strokeDirections[i].d2 != b.directions[i].d2) ) {
             return -1;
         } else {
                //Diagonal next
                if ((strokeDirections[i].d1 == a.directions[i].d1 && strokeDirections[i].d1 != b.directions[i].d1)) {
                    return -1;
                } else {
                    return 1;
                }
         }
         
     }
    
        // sort by stroke points match for each Stroke
        for (var i = 0; i < a.strokeOrder.length; i++) {

            if (typeof a.strokeOrder[i].matchPercent !='undefined') {
                if (a.strokeOrder[i].matchPercent < b.strokeOrder[i].matchPercent ) {
                    return -1;
                }

                if (a.strokeOrder[i].matchPercent > b.strokeOrder[i].matchPercent) {
                    return 1;
                }
            }
        }
        
        //sort by stroke angle match, ORDER BY stroke index DESC is a must
        for (var i=0; i<strokeCount; i++) {
            
            var aA  =   Math.abs(strokeDirections[i].a - a.directions[i].a);
            var bA  =   Math.abs(strokeDirections[i].a - b.directions[i].a);
            
            if (aA<bA) {
                return -1;
            } else {
                return 1;
            }        
        }        
        
       
        return 0;
    }
    
    //EOF: MATCH SORT FILTER
        
      
    //display all matched dictionary chars 
    function showResults() {

        if (strokeCount == 0)
            return;

        var dictOption = lookupDictType; 
        var dictFilePath = 'hwdata/tegaki/' + dictOption + '/' + strokeCount + '.json';
        
//        console.log('using dictionary DB:' + dictFilePath);

        //clear previous recogination data
        resetResults();
        
        //get match chars by Stroke Count        
        $.getJSON(dictFilePath, function(data) {

                var newDictFilePath = 'hwdata/tegaki/' + dictOption + '/' + (strokeCount+1) + '.json';
                
                 $.getJSON(newDictFilePath, function(nextData) {
                        var dictData    =   data.concat(nextData);
                       
                        var resultData = getMatchChars(dictData);
                        
                        createResultsData(resultData);

                 });
    

        });

    }
    
    //create results data base won match chars
    this.createResultsData  =   function(resultData) {
        var charsContainer;
        
        charsContainer = $('<div class="row"></div>');

        $.each(resultData, function(index, code) {

            var char = $('<div></div>').attr('class', "col-md-2");
            var charText = '<span class="btn btn-default" data-button="dictchar" >' + String.fromCharCode(code.code) + '</span>';
            char.append(charText);

            charsContainer.append(char);
        });

        $('#' + dictContainer).append(charsContainer);
    }


    function clearStrokes() {


        context.lineWidth = 1;        
        context.clearRect(0, 0, canvas.width, canvas.height);
        //redraw axis lines
        drawAxisLines();

        resetResults();

        prevPoint 	=	null;
        strokeLines    =	[];

        strokeCount = 0;
        strokeOrder =   [];
        strokeDirections    =   [];
        radicalCount = 0;

    }

    function showCounter() {
        if (debug) {
            $('#counter').show();
            $('#strokeCount').html('Stroke Count: ' + strokeCount).show();
            $('#radicalCount').html('Radical Count: ' + radicalCount).show();
        }
    }
    
    
    //
     $.fn.handwriting = function( options ) {
 
        // This is the easiest way to have default options.
        var settings = $.extend({
            // These are the defaults.
            canvasID: 'handwriting-canvas',
            resultsDiv: 'dictContainer',
            resultsPerRow: 5, // numer of match chars per row in display results
            width:  400,
            height: 400,
            dictType:   'simplified',
            searchTextId: searchTextId,
            dictCharId:  dictCharId,
            btnSearchId: 'btnSearch'
            
        }, options );
        
      return  this.each( function() {
            init(settings);
       });

 
    };

}( jQuery ));