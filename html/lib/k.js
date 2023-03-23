
const converter = new showdown.Converter({
    sanitizeHtml: true
});

const {
    createApp
} = Vue

//在某些vue js update之后，标记不要进行涂色和滚动操作
let noscroll=false

const app = createApp({
    data() {
        return {
            messages: [],
            newMessage: '',
            sending: false,
            failed:false,
            error: '',
            usage: ''
        }
    },
    updated() {
        //高亮
        hljs.highlightAll();
        if(noscroll){
            noscroll=false
            return
        }
        //滚动到底部
        //window.scrollTo(0, document.body.scrollHeight);
        //输入框
        //$('#talk').focus()
        //
        //对手机来说，开了focus就会持续打开键盘，所以不开

               this.$refs.chatHistory.scrollTop = this.$refs.chatHistory.scrollHeight;
    },

    methods: {
        previewFiles(event) {
            //读取json对话记录
            const file = event.target.files[0];

            const reader = new FileReader();
            reader.readAsText(file);

            reader.onload = (event) => {
                //清空
                while(this.messages.length>0)this.messages.pop()
                //读取
                let lines = event.target.result.split('\n')
                for (let i in lines) {
                    if (lines[i].trim().length < 1) continue
                    this.messages.push(JSON.parse(lines[i]))
                }
            };
            reader.onerror = (event) => {
                console.error('Error reading file:', event.target.error);
            };
        },
        deleteMessage(index){
            //删除单一条目的时候，不要滚动到页面尾部
            noscroll=true
            this.messages.splice(index,1)
        },
        mark(s) {
            return converter.makeHtml(s)
        },
        sendMessage() {
            //从输入框读取，然后发送
            if (this.newMessage.trim().length < 1) return
            this.messages.push({
                role: 'user',
                content: this.newMessage
            })
            this.newMessage = ''
            this.send()
        },
        retry() {
            //重试发送
            this.failed=false
            this.error=''
            this.send()
        },
        withdraw(){
            //撤回一次失败的发送
            this.failed=false
            this.error=''
            this.sending=false
            this.messages.pop()
        },
        abort(){
            this.sending.abort()
        },
        send() {
            //发送
            $('title').text(this.newMessage.trim())

            this.sending=$.post({
                url: remote_url,
                data: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    "messages": this.messages,
                    "temperature": 0.7
                }),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + key
                },
                success: data => {
                    this.error = ''
                    this.sending = false
                    console.log(data)
                    this.usage = (JSON.stringify(data.usage))
                    for (let i in data.choices) 
                        this.messages.push( data.choices[i].message)
                    
                },
                error: xhr => {
                    this.failed=true
                    console.log(xhr)
                    let s1
                    if (xhr.responseJSON) {
                        s1 = xhr.responseJSON.error.code + ' ' + xhr.responseJSON.error.message + '<br/>'
                    } else {
                        s1 = '连接失败。'
                        //setTimeout(this.send, 5000)
                    }
                    this.error += s1
                }
            });
        }
    },
})



app.mount('#app')
