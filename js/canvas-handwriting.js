$(document).ready(function() {

    var canvas = document.getElementById('handwriting-canvas');
    var strokeCount = 0;
    var strokeOrder =   []; // array of stroke orders information
    var radicalCount = 0;
    var searchString = '';
    var matchRange    =   1;
    

    canvas.width = 400;
    canvas.height = 400;

    c = canvas.getContext('2d');

    function getpos(e) {
        var offset = $(canvas).offset()
        return {
            x: e.pageX - offset.left,
            y: e.pageY - offset.top,
        }
    }

    TAN_HALF_PI = Math.tan(Math.PI / 2)

    function direction(d) {
        var horiz = (Math.abs(d.x) > Math.abs(d.y))
        if (horiz) {
            if (d.x < 0)
                return 0;
            return 1;
        } else {
            if (d.y < 0)
                return 2;
            return 3;
        }
    }

    colors = ['rgba(255,0,0,0.5)',
        'rgba(0,255,0,0.5)',
        'rgba(0,0,255,0.5)',
        'rgba(200,200,0,0.5)',
    ]

    function vector(x, y) {
        return {
            x: x,
            y: y,
        }
    }

    function delta(a, b) {
        return vector(a.x - b.x, a.y - b.y)
    }

    function angle(d) {
        return Math.atan((1.0 * d.y) / d.x)
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

    
    // draw Axis Lines
    function drawAxisLines() {
      var context   =    canvas.getContext('2d');
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

    drawAxisLines();
    
    // Mouse Down
    $(canvas).on('mousedown', function(e) {
        prev = getpos(e)
        line = [prev]


        $(canvas).on('mousemove', function(e) {
            pos = getpos(e)

            c.beginPath();
            c.moveTo(prev.x, prev.y);
            c.lineTo(pos.x, pos.y);
            c.stroke()

            prev = pos
            line.push(pos)

        })

        c.strokeStyle = "rgba(0,0,0,0.2)"

        //Stroke ENDED 
        $(canvas).on('mouseup', function() {
            $(canvas).unbind('mousemove').unbind('mouseup')
            corners = [line[0]]
            var n = 0
            var t = 0
            var lastCorner = line[0]
            for (var i = 1; i < line.length - 2; i++) {

                var pt = line[i + 1]
                var d = delta(lastCorner, line[i - 1])

                if (len(d) > 20 && n > 2) {
                    ac = delta(line[i - 1], pt)
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

            if (len(delta(line[line.length - 1], line[0])) < 25) {
                corners.push(line[0])

                c.fillStyle = 'rgba(0, 0, 255, 0.3)'

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
                        c.fillStyle = 'rgba(0, 255, 255, 0.3)'
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

                c.beginPath()
                c.moveTo(corners[0].x, corners[0].y)
                for (var i = 1; i < corners.length; i++) {
                    c.lineTo(corners[i].x, corners[i].y)
                }
                c.fill()
            } else {
                corners.push(line[line.length - 1])
            }

            c.strokeStyle = 'rgba(0, 0, 255, 0.5)'
            c.beginPath()
            c.moveTo(corners[0].x, corners[0].y)
            for (var i = 1; i < corners.length; i++) {
                c.lineTo(corners[i].x, corners[i].y)
            }
            c.stroke()


            c.fillStyle = 'rgba(255, 0, 0, 0.5)'
            for (var i = 0; i < corners.length; i++) {
                c.beginPath()
                c.arc(corners[i].x, corners[i].y, 4, 0, 2 * Math.PI, false)
                c.fill()
            }

            //count when new stroke draw ended
            strokeCount++;

           // console.log(corners);

            strokeOrder[strokeCount]    =    corners.length;
            showCounter();

            showResults(strokeCount);
            
            // console.log(strokeOrder);

        })
    })


    //BOF: TOUCH SUPPORT
    var mc = new Hammer.Manager(canvas);
    var pan = new Hammer.Pan({direction: Hammer.DIRECTION_ALL});
    mc.add(pan);

    mc.on("panstart", function(e) {
     //   console.log(e);

    });
    //EOF:  TOUCH SUsPPORT


    // get match chars bystroke order
    function getMatchChars(dictData) {
        
       //return dictData;
        
        console.log(strokeOrder);
        
        var matchData   =   [];
        var isMatch =   true;
        $.each(dictData, function(index, data) {
            isMatch =   true;
            
            for (var i=0; i<strokeCount; i++) {
               if ( (strokeOrder[i+1] - matchRange <= data.strokeOrder[i]) || ( strokeOrder[i+1] <=  data.strokeOrder[i])   ) {
                    // process match order
                    data.strokeOrder[i] =   {'matchPercent': Math.abs(strokeOrder[i+1] -data.strokeOrder[i])};
                    
                    
               } else {
                   isMatch  =   false;
                   break;
               }               
            }
            
            if (isMatch)
                matchData.push(data);

        });
        

        function matchCompare(a,b) {
            for (var i=0; i< a.strokeOrder.length; i++) {
                if (a.strokeOrder[i].matchPercent< b.strokeOrder[i].matchPercent) {
                    return - 1;
                }
                if (a.strokeOrder[i].matchPercent> b.strokeOrder[i].matchPercent) {
                    return 1;
                }
            }
            return 0;
        }
        
      matchData.sort(matchCompare);
        
        console.log(matchData);
        
        return matchData;
    }
    
    //display all matched dictionary chars 
    function showMatchedResults(count) {

        if (strokeCount == 0)
            return;

        var dictOption = $('#dict:checked').val();
        var dictFilePath = 'data/tegaki/' + dictOption + '/' + strokeCount + '.json';
        var charsContainer;

        //clear previous recogination data
        $('#dictContainer').html('');
        
        //get match chars by Stroke Count        
        $.getJSON(dictFilePath, function(data) {
            
            // if have stroke count data
            if (data) {
                
                var dictData    =   data;
                // add more recognization data from next stroke count Chars to try to guess what next data user want to find
                 var newDictFilePath = 'data/tegaki/' + dictOption + '/' + (strokeCount+1) + '.json';
                
                 $.getJSON(newDictFilePath, function(nextData) {
                        dictData    =   dictData.concat(nextData);
                        
                        var resultData = getMatchChars(dictData);

                        charsContainer = $('<div class="row"></div>');

                        $.each(resultData, function(index, code) {

                            var char = $('<div></div>').attr('class', "col-md-2").html('<span class="btn btn-default" data-button="char" >' + String.fromCharCode(code.code) + '</span>');
                            charsContainer.append(char);
                        });

                        $('#dictContainer').append(charsContainer);
                 });
            }


        });

    }
    
    
    //display all matched dictionary chars 
    function showResults(count) {

        if (strokeCount == 0)
            return;

        var dictOption = $('#dict:checked').val();
        var dictFilePath = 'data/tegaki/' + dictOption + '/' + strokeCount + '.json';
        var charsContainer;

        //clear previous recogination data
        $('#dictContainer').html('');
        
        //get match chars by Stroke Count        
        $.getJSON(dictFilePath, function(data) {
            

            var resultData = getMatchChars(data);

            charsContainer = $('<div class="row"></div>');

            $.each(resultData, function(index, code) {

                var char = $('<div></div>').attr('class', "col-md-2").html('<span class="btn btn-default" data-button="char" >' + String.fromCharCode(code.code) + '</span>');
                charsContainer.append(char);
            });

            $('#dictContainer').append(charsContainer);
    

        });

    }

    //add selected char to Search field
    $("#dictContainer").on('mouseup touchend', "[data-button='char']", function(e) {
        e.preventDefault();
        searchString += $(this).html();
        $("#searchText").val(searchString);
    });


    //do Search
    $('#btnSearch').on('mouseup', function() {
        $("#searchText").val('');
        clearStrokes();
    });


    //dictionary type changed
    $("#dict").change(function() {
        showResults(strokeCount);
    });

    //Clear Canvas Content
    $('#clear').click(function() {
        clearStrokes();
        showCounter();

    })


    function clearStrokes() {
        c.clearRect(0, 0, canvas.width, canvas.height);
        drawAxisLines();
        
        //clear previous recogination data
        $('#dictContainer').html('');

        strokeCount = 0;
        radicalCount = 0;

    }

    function showCounter() {
        $('#counter').show();
        $('#strokeCount').html('Stroke Count: ' + strokeCount).show();
        $('#radicalCount').html('Radical Count: ' + radicalCount).show();
    }

})