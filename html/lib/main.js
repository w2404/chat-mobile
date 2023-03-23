var messages = []
var converter = new showdown.Converter({
    sanitizeHtml: true
});
//var converter = new showdown.Converter(); //{sanitizeHtml: true});

function send() {
    //window.scrollTo(0, document.body.scrollHeight);
    $('#send').prop('disabled', true)
    $('#talk1').prop('disabled', true)
    $('#talk2').prop('disabled', true)
    $('#send').val('等待中...')
    $('#talk2').prop('placeholder', "等待中...") //aaa请输入内容，按回车发送")

    $.post({
        url: 'https://api.openai.com/v1/chat/completions',
        data: JSON.stringify({
            model: "gpt-3.5-turbo",
            "messages": messages,
            "temperature": 0.7
        }),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + key
        },
        success: function(data) {
            $('#error').html('')

            $('#send').prop('disabled', false)
            $('#talk1').prop('disabled', false)
            $('#talk2').prop('disabled', false)
            $('#send').val('发送')
            $('#talk2').prop('placeholder', "请输入内容，按回车发送。") //"等待中...") //aaa请输入内容，按回车发送")

            maintalk.focus()

            console.log(data)
            $('#usage').text(JSON.stringify(data.usage))
            for (var i in data.choices) {
                var m = data.choices[i].message
                show_message(m)
            }
        },
        error: function(xhr, status, error) {
            //console.log('Error:')
            //console.log( error)
            console.log(xhr)
            //console.log( status)
            //send()
            setTimeout(send, 5000)
            var s1
            if (xhr.responseJSON) {
                s1 = xhr.responseJSON.error.code + ' ' + xhr.responseJSON.error.message + '<br/>'
            } else {
                s1 = '连接失败，5秒后重试...<br/>'
            }
            var s2 = $('#error').html()
            $('#error').html(s2 + s1)
        }
    });
}

function convert(s) {
    //return marked.parse(s);
    //   s=s.replace(/</g,'&lt;').replace(/>/g,'&gt;')
    //    return '<pre>'+s+'</pre>'
    return converter.makeHtml(s);
}

function show_message(m) {
    console.log(m)
    messages.push(m)
    var s1 = m.role
    var s2 = convert(m.content)
    console.log(s2)

    //$('#messages').append('<div><pre>'+s1+':'+s2+'</pre></div>')
    $('#messages').append('<tr><td >' + s1 + ':</td><td>' + s2 + '</td></tr>')

    //Prism.highlightAll();
    hljs.highlightAll();

    window.scrollTo(0, document.body.scrollHeight);
}

function submit() {
    //$('#messages').append('<div>----------------------</div>')

    var s = maintalk.val()
    if (s.trim().length < 1) return
    $('title').text(s.trim())
    var m = {
        role: 'user',
        content: s
    }
    $('#talk2').val('')
    $('#talk1').val('')
    show_message(m)
    send()

    $('#a1').show()
    $('#a2').show()
    $('#save').show()
}

$(function() {
    $('#send').click(submit)

    $('#talk2').keypress(function(event) {
        if (event.which == 13) {
            submit()
        }
    });

    $('#a1').hide().attr('href', '?' + new Date().getTime())
    $('#a2').hide().attr('href', '?' + (1 + new Date().getTime()))
    $('#save').hide()



})

//切换对话框
var switchbtn
var maintalk

function switch1() {
    $('#talk1').hide()
    $('#send').hide()
    $('#talk2').show().focus()
    switchbtn = switch2
    maintalk = $('#talk2')
}

function switch2() {
    $('#talk1').show().focus()
    $('#send').show()
    $('#talk2').hide()
    switchbtn = switch1
    maintalk = $('#talk1')
}
$(function() {
    switch1()
})


//保存json对话记录
function savemessages() {
    var s = ''
    for (var i in messages) {
        s += JSON.stringify(messages[i]) + '\n'
    }
    var n = messages[0].content + '.json'
    saveblob(n, s)

    s = ''
    for (var i in messages) {
        s += messages[i].role + ':' + messages[i].content.trim() + '\n'
    }
    n = messages[0].content + '.txt'
    //txt暂时没用，因为gpt不能读外部连接
    //saveblob(n,s)
}

function saveblob(name, content) {
    name = name.replace('/', '-').replace('\'', '-')
    //var content = "Hello, World!";
    var blob = new Blob([content], {
        type: "text/plain;charset=utf-8"
    });
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = name; // "myFile.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

//读取json对话记录
$(function() {


    const fileInput = document.getElementById('fileinput');

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];

        const reader = new FileReader();
        reader.readAsText(file);

        reader.onload = (event) => {
            var lines = event.target.result.split('\n')
            messages = []
            $('#messages').html('')
            for (var i in lines) {
                if (lines[i].trim().length < 1) continue
                var o = JSON.parse(lines[i])
                messages.push(o)
                show_message(o)
            }
        };

        reader.onerror = (event) => {
            console.error('Error reading file:', event.target.error);
        };
    });
})