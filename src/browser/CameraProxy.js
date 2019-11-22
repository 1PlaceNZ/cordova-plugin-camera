/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

var HIGHEST_POSSIBLE_Z_INDEX = 2147483647;

function takePicture (success, error, opts) {
    if (opts && opts[2] === 1) {
        capture(success, error, opts);
    } else {
        var input = document.createElement('input');
        var parent = document.createElement('div');
        var modal = document.createElement('div');
        var buttons = document.createElement('div');
        var cancel = document.createElement('button');
        cancel.innerHTML = 'Cancel';
        // parent.style.position = 'relative';
        parent.style.zIndex = HIGHEST_POSSIBLE_Z_INDEX;
        parent.className = 'cordova-camera-capture-div';
        modal.className = 'cordova-camera-capture-modal'
        buttons.appendChild(cancel);
        modal.appendChild(input);
        modal.appendChild(buttons);
        parent.appendChild(modal);
        input.style.zIndex = HIGHEST_POSSIBLE_Z_INDEX;
        input.className = 'cordova-camera-select';
        input.type = 'file';
        input.name = 'files[]';

        input.onchange = function (inputEvent) {
            var reader = new FileReader(); /* eslint no-undef : 0 */
            reader.onload = function (readerEvent) {
                parent.parentNode.removeChild(parent);

                var imageData = readerEvent.target.result;

                return success(imageData.substr(imageData.indexOf(',') + 1));
            };

            reader.readAsDataURL(inputEvent.target.files[0]);
        };
        cancel.onclick = function () {
            parent.parentNode.removeChild(parent);
            return;
        };

        document.body.appendChild(parent);
    }
}

function capture (success, errorCallback, opts) {
    var localMediaStream;
    var targetWidth = opts[3];
    var targetHeight = opts[4];

   // if (targetWidth === 1024 && targetHeight === 1024 ) {
   //     targetHeight = 768;
   // }

    // targetWidth = targetWidth === -1 ? 320 : targetWidth;
    // targetHeight = targetHeight === -1 ? 240 : targetHeight;

    var videoblock = document.createElement('div');
    var video = document.createElement('video');
    videoblock.appendChild(video);
    var button = document.createElement('button');
    var parent = document.createElement('div');
    var modal = document.createElement('div');
    var buttons = document.createElement('div');
    var cancel = document.createElement('button');
    var select = document.createElement('select');
    var selectButton = document.createElement('button');

    var sizeDiv = document.createElement('div');
    var qvgaButton = document.createElement('button');
    var vgaButton = document.createElement('button');
    var qHdButton = document.createElement('button');
    var hdButton = document.createElement('button');
    var fullHdButton = document.createElement('button');

    sizeDiv.appendChild(qvgaButton);
    sizeDiv.appendChild(vgaButton);
    sizeDiv.appendChild(qHdButton);
    sizeDiv.appendChild(hdButton);
    sizeDiv.appendChild(fullHdButton);

    cancel.innerHTML = 'Cancel';
    //parent.style.position = 'relative';
    parent.style.zIndex = HIGHEST_POSSIBLE_Z_INDEX;
    parent.className = 'cordova-camera-capture-div';
    modal.className = 'cordova-camera-capture-video-modal'
    parent.appendChild(modal);
    modal.appendChild(sizeDiv);
    modal.appendChild(videoblock);
    buttons.appendChild(select);
    buttons.appendChild(selectButton);
    buttons.appendChild(button);
    buttons.appendChild(cancel);

    modal.appendChild(buttons);
    // use 10% modal; padding widht and 10 paddint
    // video.width = targetWidth > document.body.clientWidth ? (document.body.clientWidth - 10 - (0.1 * document.body.clientWidth)) : targetWidth;
    // video.height = targetWidth > document.body.clientWidth ?  (document.body.clientWidth - 10 - (0.1 * document.body.clientWidth)) / 1.33 : targetHeight;
    // if (video.height > (window.innerHeight - 80 - (0.1 * window.innerHeight)) ) {
    //    video.height = (window.innerHeight - 80 - (0.1 * window.innerHeight))
    // }

    videoblock.style.display = 'block';
    // video.style.width = video.width + 'px';
    button.innerHTML = 'Capture!';
    selectButton.innerHTML = 'Start Camera';
    qvgaButton.innerHTML = 'QVGA';
    vgaButton.innerHTML = 'VGA';
    qHdButton.innerHTML = 'qHD';
    hdButton.innerHTML = 'HD';
    fullHdButton.innerHTML = 'Full HD';

    qvgaButton.onclick = function () {
        changeCamera(qvgaConstraints());
    }
    vgaButton.onclick = function () {
        changeCamera(vgaConstraints());
    }
    qHdButton.onclick = function () {
        changeCamera(qHdConstraints());
    }
    hdButton.onclick = function () {
        changeCamera(hdConstraints());
    }
    fullHdButton.onclick = function () {
        changeCamera(fullHdConstraints());
    }
    button.onclick = function () {
        // create a canvas and capture a frame from video stream
        var canvas = document.createElement('canvas');
        canvas.width = video.clientWidth? video.clientWidth : targetWidth;
        canvas.height = video.clientHeight? video.clientHeight : targetHeight;
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

        // convert image stored in canvas to base64 encoded image
        var imageData = canvas.toDataURL('image/png');
        imageData = imageData.replace('data:image/png;base64,', '');

        // stop video stream, remove video and button.
        // Note that MediaStream.stop() is deprecated as of Chrome 47.
        if (localMediaStream.stop) {
            localMediaStream.stop();
        } else {
            localMediaStream.getTracks().forEach(function (track) {
                track.stop();
            });
        }
        if ('srcObject' in video) {
            video.srcObject = null;
        } else {
            video.src = null;
        }

        parent.parentNode.removeChild(parent);

        return success(imageData);
    };
    cancel.onclick = function () {
        if (typeof localMediaStream !== 'undefined') {
            stopMediaTracks(localMediaStream);
        }
        if ('srcObject' in video) {
            video.srcObject = null;
        } else {
            video.src = null;
        }
        parent.parentNode.removeChild(parent);
        return;
    }
    navigator.getUserMedia = navigator.getUserMedia ||
                             navigator.webkitGetUserMedia ||
                             navigator.mozGetUserMedia ||
                             navigator.msGetUserMedia;

    var displayVideo = function (stream) {
        if ('srcObject' in video) {
            video.srcObject = stream;
        } else {
            video.src = window.URL.createObjectURL(stream);
        }
        track = stream.getVideoTracks()[0];
        constraints = track.getConstraints();
        settings = track.getSettings();
        console.log('Result constraints: ' + JSON.stringify(constraints));
        console.log('Result settings: ' + JSON.stringify(track.getSettings()));

        if (constraints && constraints.width && constraints.width.exact) {
            targetWidth = constraints.width.exact;
            targetHeight = constraints.height.exact;
        } else if (constraints && constraints.width && constraints.width.min) {
            targetWidth = constraints.width.min;
            targetHeight = constraints.height.min;

        } else if (settings && settings.width) {
            targetWidth = settings.width;
            targetHeight = settings.height;
        }
        // {"deviceId":"256A0A26AD51ADBE48732ED31F51D21E68E79E4C","frameRate":30,"height":480,"width":640}
        videoblock.style.display = 'block';
        video.style.width = targetWidth + 'px';
        video.videoWidth = targetWidth + 'px';
        video.videoHeight = targetHeight + 'px';
        //add style height doesn't play nicely with android chome
        video.play();
    }

    var setupCallback = function (stream) {
        navigator.mediaDevices.enumerateDevices().then(gotDevices);
        localMediaStream = stream;
        displayVideo(stream);
        document.body.appendChild(parent);
    };

    var successCallback = function (stream) {
        localMediaStream = stream;
        displayVideo(stream);
    };

    var gotDevices = function (mediaDevices) {
        select.innerHTML = '';
        select.appendChild(document.createElement('option'));
        let count = 1;
        mediaDevices.forEach(mediaDevice => {
            if (mediaDevice.kind === 'videoinput') {
                const option = document.createElement('option');
                option.value = mediaDevice.deviceId;
                const label = mediaDevice.label || `Camera ${count++}`;
                // const textNode = document.createTextNode(label);
                // option.appendChild(textNode);
                option.text = label;
                select.appendChild(option);
            }
        });
    }

    var stopMediaTracks= function(stream) {
        stream.getTracks().forEach(track => {
          track.stop();
        });
    }

    var changeCamera = function(constraint) {
        if (typeof localMediaStream !== 'undefined') {
            stopMediaTracks(localMediaStream);
          }
          const videoConstraints = constraint;
          if (select.value === '') {
              videoConstraints.video.facingMode = 'environment';
          } else {
              videoConstraints.video.deviceId = { exact: select.value };
              delete videoConstraints.video.facingMode;
          }
          console.log(videoConstraints);

          if (navigator.mediaDevices.getUserMedia) {
              navigator.mediaDevices.getUserMedia(videoConstraints)
              .then(function(stream) {
                  successCallback(stream);
              })
              .catch(function(err) {
                console.log(err);
                if (err.constraint) {
                    alert('Camera doesn\'t support this resolution');
                }
                if (errorCallback) {
                      errorCallback(err)
                }
              });

          } else if (navigator.getUserMedia) {
              navigator.getUserMedia(videoConstraints)
              .then(function(stream) {
                  successCallback(stream);
              })
              .catch(function(err) {
                console.log(err);
                if (err.constraint) {
                    alert('Camera doesn\'t support this resolution');
                }
                if (errorCallback) {
                    errorCallback(err)
                }
              });
          }
    }

    selectButton.addEventListener('click', event => {
        changeCamera(qvgaConstraints());
    });

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        console.log(JSON.stringify(navigator.mediaDevices.getSupportedConstraints()));
        navigator.mediaDevices.getUserMedia(qvgaConstraints())
        .then(function(stream) {
            setupCallback(stream);
        })
        .catch(function(err) {
            console.log(err);
            if (errorCallback) {
                errorCallback(err)
            }
        })
    } else if (navigator.getUserMedia) {
        navigator.mediaDevices.enumerateDevices().then(gotDevices);
    } else {
        console.log('Browser does not support camera :(');
        opts[2] = 2;
        takePicture(success, errorCallback, opts)
    }
}

function isLandscape() {
    var orientation = screen.msOrientation || screen.mozOrientation || (screen.orientation || {}).type;
    if (orientation === "landscape-primary") {
        return true;
      } else if (orientation === "landscape-secondary") {
        return true;
      } else if (orientation === "portrait-secondary" || orientation === "portrait-primary") {
        return false;
      } else if (orientation === undefined) {
        return window.innerWidth > window.innerHeight;
      }
}

function qvgaConstraints() {
    if (isLandscape()){
        return {
            video: {
                facingMode: 'environment',
                width: {
                    exact: 320
                },
                height: {
                    exact: 240
                }
            },
            audio: false
        }
    } else {
        return {
            video: {
                facingMode: 'environment',
                width: {
                    exact: 240
                },
                height: {
                    exact: 320
                }
            },
            audio: false
        }
    }
}

function vgaConstraints() {
    if (isLandscape()){
        return {
            video: {
                facingMode: 'environment',
                width: {
                    exact: 640
                },
                height: {
                    exact: 480
                }
            },
            audio: false
        }
    } else{
        return {
            video: {
                facingMode: 'environment',
                width: {
                    exact: 480
                },
                height: {
                    exact: 640
                }
            },
            audio: false
        }
    }
}

function qHdConstraints(){
    if (isLandscape()){
        return {
            video: {
                facingMode: 'environment',
                width: {
                    exact: 690
                },
                height: {
                    exact: 540
                }
            },
            audio: false
        }
    } else{
        return {
            video: {
                facingMode: 'environment',
                width: {
                    exact: 540
                },
                height: {
                    exact: 960
                }
            },
            audio: false
        }
    }
}

function hdConstraints() {
    if (isLandscape()){
        return {
            video: {
                facingMode: 'environment',
                width: {
                    exact: 1280
                },
                height: {
                    exact: 720
                }
            },
            audio: false
        }
    } else{
        return {
            video: {
                facingMode: 'environment',
                width: {
                    exact: 720
                },
                height: {
                    exact: 1280
                }
            },
            audio: false
        }
    }
}

function fullHdConstraints() {
    if (isLandscape()){
        return {
            video: {
                facingMode: 'environment',
                width: {
                    exact: 1920
                },
                height: {
                    exact: 1080
                }
            },
            audio: false
        }
    } else {
        return {
            video: {
                facingMode: 'environment',
                width: {
                    exact: 1080
                },
                height: {
                    exact: 1920
                }
            },
            audio: false
        }
    }
}


module.exports = {
    takePicture: takePicture,
    cleanup: function () {}
};

require('cordova/exec/proxy').add('Camera', module.exports);
