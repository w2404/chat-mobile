$(function(){
            // 创建SpeechRecognition对象
            var recognition = new webkitSpeechRecognition();
            recognition.lang = 'zh-CN'; // 设置语言为中文
            recognition.continuous = true; // 设置是否连续识别
            recognition.interimResults = true; // 设置是否返回中间结果
            // 开始识别
            recognition.start();
            // 监听识别结果
            recognition.onresult = function(event) {
                //var result = event.results[0][0].transcript;
                var s=''
                for(var i in event.results){
                    s+= event.results[i][0].transcript;
                }
                //var s=$('#talk').val()
                $('#talk').val(s) //+result)
            };
            // 监听识别错误
            recognition.onerror = function(event) {
                console.error(event.error);
            };

            // 监听识别结束
            recognition.onend = function() {
                console.log('识别结束');
            };
})
