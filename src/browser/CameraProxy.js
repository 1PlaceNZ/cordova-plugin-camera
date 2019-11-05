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
        var cancel = document.createElement('button');
        cancel.innerHTML = 'Cancel';
        // parent.style.position = 'relative';
        parent.style.zIndex = HIGHEST_POSSIBLE_Z_INDEX;
        parent.className = 'cordova-camera-capture-div';
        modal.className = 'cordova-camera-capture-modal'
        modal.appendChild(input);
        modal.appendChild(cancel);
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

    targetWidth = targetWidth === -1 ? 320 : targetWidth;
    targetHeight = targetHeight === -1 ? 240 : targetHeight;

    var video = document.createElement('video');
    var button = document.createElement('button');
    var parent = document.createElement('div');
    var modal = document.createElement('div');
    var cancel = document.createElement('button');
    cancel.innerHTML = 'Cancel';
    //parent.style.position = 'relative';
    parent.style.zIndex = HIGHEST_POSSIBLE_Z_INDEX;
    parent.className = 'cordova-camera-capture-div';
    modal.className = 'cordova-camera-capture-video-modal'
    parent.appendChild(modal);
    modal.appendChild(video);
    modal.appendChild(button);
    modal.appendChild(cancel);

    video.width = targetWidth > document.body.clientWidth ? document.body.clientWidth - 10 : targetWidth;
    video.height = targetWidth > document.body.clientWidth ?  document.body.clientWidth - 10 : targetHeight;
    button.innerHTML = 'Capture!';

    button.onclick = function () {
        // create a canvas and capture a frame from video stream
        var canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        canvas.getContext('2d').drawImage(video, 0, 0, targetWidth, targetHeight);

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
        parent.parentNode.removeChild(parent);

        return success(imageData);
    };
    cancel.onclick = function () {
        parent.parentNode.removeChild(parent);
        return;
    }
    navigator.getUserMedia = navigator.getUserMedia ||
                             navigator.webkitGetUserMedia ||
                             navigator.mozGetUserMedia ||
                             navigator.msGetUserMedia;

    var successCallback = function (stream) {
        localMediaStream = stream;
        if ('srcObject' in video) {
            video.srcObject = localMediaStream;
        } else {
            video.src = window.URL.createObjectURL(localMediaStream);
        }
        video.play();
        document.body.appendChild(parent);
    };

    if (navigator.getUserMedia) {
        navigator.getUserMedia({video: true, audio: false}, successCallback, errorCallback);
    } else {
        alert('Browser does not support camera :(');
    }
}

module.exports = {
    takePicture: takePicture,
    cleanup: function () {}
};

require('cordova/exec/proxy').add('Camera', module.exports);
