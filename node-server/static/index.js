document.querySelector("#btn-fold-in").addEventListener("click", (e) => {
    const sidebar = document.querySelector(".sidebar");
    sidebar.style.width = 0

    const btnFoldOut = document.querySelector("#btn-fold-out");
    btnFoldOut.style.display = "inline-block"
})

document.querySelector("#btn-fold-out").addEventListener("click", (e) => {
    const sidebar = document.querySelector(".sidebar");
    sidebar.style.width = "260px"

    e.target.style.display = "none"
})

const attch = document.getElementById('input-attachment');
const inputSend = document.getElementById('input-send');
const tooltip = document.getElementById('tooltip');

// 鼠标悬浮事件
inputSend.addEventListener('mouseover', function() {
tooltip.style.display = 'block'; // 显示文本框
// 设置文本框的位置
tooltip.style.left = inputSend.offsetLeft - 40 + 'px';
tooltip.style.top =  (inputSend.offsetTop + inputSend.offsetHeight) - 65 + 'px';
//inputSend.style.color = "blue";
});

// 鼠标离开事件
inputSend.addEventListener('mouseout', function() {
    tooltip.style.display = 'none'; // 隐藏文本框
    // inputSend.style.color = "grey";
});


document.getElementById('input-chat').addEventListener('input', function() {
    if (this.value.trim() !== '') {
        document.querySelector('#input-send').classList.add('active');
    } else {
        document.querySelector('#input-send').classList.remove('active');
    }
});


 // 当DOM内容加载完成后执行脚本
 document.addEventListener('DOMContentLoaded', function() {
    const inputAttachment = document.getElementById('input-attachment');
    const tooattchtooltipltip = document.getElementById('attchtooltip');

    // 鼠标悬浮事件监听器
    inputAttachment.addEventListener('mouseover', function() {
        attchtooltip.style.display = 'block';
        // 设置tooltip的位置
        const rect = inputAttachment.getBoundingClientRect();
        attchtooltip.style.left = rect.right - 50 + 'px';
        attchtooltip.style.top = rect.top -80 + 'px';
        document.querySelector('#input-attachment').classList.add('active');
    });

    // 鼠标移出事件监听器
    inputAttachment.addEventListener('mouseout', function() {
        attchtooltip.style.display = 'none';
        document.querySelector('#input-attachment').classList.remove('active');
    });
});

function sendRequest(){
    const text = document.querySelector("#input-chat").value
    const data = {
        input: {
            language: "中文",
            text
        },
        config: {}
    };

    const resLog = document.querySelector("#res-log")
    const selfMsg = document.createElement("div");
    selfMsg.innerText = text;
    selfMsg.className = "self-msg"
    resLog.appendChild(selfMsg);

    const llmMsg = document.createElement("div");
    const llmMsg_P = document.createElement("p");
    llmMsg.className = "llm-msg"
    llmMsg.appendChild(llmMsg_P);
    resLog.appendChild(llmMsg);

    fetch("http://127.0.0.1:8000/chain/stream_log",{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    }).then(response => {
        if (response.ok) {
            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            const res = llmMsg_P;


            function read() {
                reader.read().then(({ done, value }) => {
                    if (done) {
                        console.log('Stream closed');
                        const llmMsg_toolbar = document.createElement("div");
                        llmMsg_toolbar.className = "tool-bar"
                        llmMsg_toolbar.innerHTML = `
                            <span class="iconfont icon-fuzhi"></span>
                            <span class="iconfont icon-shuaxin"></span>
                            <span class="iconfont icon-cai"></span>
                        `
                        llmMsg.appendChild(llmMsg_toolbar);
                        return;
                    }

                    const chunk = decoder.decode(value, { stream: true });
                    // console.log(1000,chunk.split('\r\n'))
                    chunk.split('\r\n').forEach(eventString => {
                        // console.log(1000,eventString);
                        if (eventString && eventString.startsWith('data: ')) {
                            // console.log(2000,eventString);
                            const str = eventString.substring("data: ".length);
                            const data = JSON.parse(str)
                            // console.log(3000,data);
                            data.ops.forEach(item => {
                                if(item.op === "add" && item.path === "/logs/ChatZhipuAI/streamed_output_str/-"){
                                    res.innerHTML += item.value;
                                }
                            })
                        }
                    });


                    read();
                }).catch(error => {
                    console.error('Stream error', error);
                });
            }

            read();
        } else {
            console.error('Network response was not ok.');
        }
    }).catch(error => {
        console.error('Fetch error:', error);
    });
}



//修改监听器
document.querySelector("#input-send").addEventListener("click", (e) => {
    removeIntroduction();
    sendRequest();
    clearInput();
})
document.querySelector("#input-chat").addEventListener("keydown", (e) => {
    if(e.keyCode === 13) { 
        removeIntroduction();
        sendRequest();
        clearInput();
    }
})

let uri = "/chain/tagging_pure/stream_log"
function sendRequest(){
    const text = document.querySelector("#input-chat").value
    console.log(text)
    /*const data = {
        input: {
            session_id: "session_1", // 确保这个值是正确的
            user_input: text        // 确保'text'变量已经被正确定义并且包含有效的字符串
        },
        config: {}
    };*/

    const requestData = {
        session_id: "session_1", // 确保这个值是正确的
        user_input: text         // 确保'text'变量已经被正确定义并且包含有效的字符串
    };

    /*fetch('http://127.0.0.1:8000/generate_response', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData) // 直接使用构造好的请求体
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log(data);
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });*/

    const resLog = document.querySelector("#res-log")
    const selfMsg = document.createElement("div");
    selfMsg.innerText = text;
    selfMsg.className = "self-msg"
    resLog.appendChild(selfMsg);

    //添加动态加载效果
    const llmMsg = document.createElement("div");
    llmMsg.className = "llm-msg"
    resLog.appendChild(llmMsg);

    llmMsg_load = document.createElement("div");
    llmMsg_load.className = "main-wrap"
    llmMsg_load.id = "cssLoader1"
    llmMsg.appendChild(llmMsg_load);
    llmMsg_load_1 = document.createElement("div");
    llmMsg_load_2 = document.createElement("div");
    llmMsg_load_3 = document.createElement("div");
    llmMsg_load_4 = document.createElement("div");
    llmMsg_load_5 = document.createElement("div");
    llmMsg_load_6 = document.createElement("div");
    llmMsg_load_7 = document.createElement("div");
    llmMsg_load_8 = document.createElement("div");
    llmMsg_load_9 = document.createElement("div");
    llmMsg_load_10 = document.createElement("div");
    llmMsg_load_1.className = "child-common child1"
    llmMsg_load_2.className = "child-common child2"
    llmMsg_load_3.className = "child-common child3"
    llmMsg_load_4.className = "child-common child4"
    llmMsg_load_5.className = "child-common child5"
    llmMsg_load_6.className = "child-common child6"
    llmMsg_load_7.className = "child-common child7"
    llmMsg_load_8.className = "child-common child8"
    llmMsg_load_9.className = "child-common child9"
    llmMsg_load_10.className = "child-common child10"
    llmMsg_load.appendChild(llmMsg_load_1);
    llmMsg_load.appendChild(llmMsg_load_2);
    llmMsg_load.appendChild(llmMsg_load_3);
    llmMsg_load.appendChild(llmMsg_load_4);
    llmMsg_load.appendChild(llmMsg_load_5);
    llmMsg_load.appendChild(llmMsg_load_6);
    llmMsg_load.appendChild(llmMsg_load_7);
    llmMsg_load.appendChild(llmMsg_load_8);
    llmMsg_load.appendChild(llmMsg_load_9);
    llmMsg_load.appendChild(llmMsg_load_10);

    const llmMsg_P = document.createElement("p");
    llmMsg.appendChild(llmMsg_P);

    fetch('http://127.0.0.1:8000/generate_response', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData) // 直接使用构造好的请求体
    })
    .then(response => {
        if (response.ok) {
            // 解析 JSON 数据
            return response.json();
        } else {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    })
    .then(data => {
        // 获取或创建容器
        //const llmMsg_P = document.getElementById('llmMsg') || createContainer();

        function convertBulletsToBreaks(text) {
            // 使用正则表达式匹配每一行以破折号开头的内容
            const lines = text.split('\n').map(line => {
                // 如果行以破折号开头，则在破折号后面添加 <br> 标签
                if (line.trim().startsWith('-')) {
                    // 使用正则表达式替换所有破折号后面的空格为 <br> 标签
                    return `${line.replace(/- /g, '<br>')}`;
                }
                // 否则直接返回原行
                return line;
            });

            // 将处理过的行合并成一个字符串
            return lines.join('');
        }
        function convertStarSurroundedTextToParagraphs(text) {
            // 使用正则表达式匹配前后各有两个星号的文本
            const regex = /\*\*(.*?)\*\*/g;

            // 替换匹配到的内容
            const replacedText = text.replace(regex, '<p>$1</p>');

            return replacedText;
        }
        // 转换文本
        var convertedText = convertBulletsToBreaks(data.response);
        const text = convertStarSurroundedTextToParagraphs(convertedText);

        const flights_info = data.flights_info
        const trains_info = data.trains_info
        // 插入到HTML元素中
        llmMsg_P.innerHTML = text;

        llmMsg_table = document.createElement("div");
        llmMsg_table.id = "flightInfoContainer"
        llmMsg.appendChild(llmMsg_table);
        // 获取HTML容器
        const container = document.getElementById('flightInfoContainer');

        // 创建表格
        const table = document.createElement('table');
        table.className = 'flight-table';

        // 创建表头
        const thead1 = document.createElement('thead');
        const headerRow1 = document.createElement('tr');
        ['航空公司', '出发机场', '到达机场', '出发时间', '到达时间', '价格'].forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow1.appendChild(th);
        });
        thead1.appendChild(headerRow1);
        table.appendChild(thead1);

        // 创建表身
        const tbody1 = document.createElement('tbody');
        flights_info.forEach(flight => {
            const row = document.createElement('tr');
            ['airline', 'departure_airport', 'arrival_airport', 'departure_time', 'arrival_time', 'price'].forEach(key => {
                const cell = document.createElement('td');
                cell.textContent = flight[key];
                row.appendChild(cell);
            });
            tbody1.appendChild(row);
        });
        table.appendChild(tbody1);

        // 将表格添加到容器
        container.appendChild(table);


        // 创建表格
        const table2 = document.createElement('table');
        table2.className = 'train-table';

        // 创建表头
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        ['出发站', '到达站', '出发时间', '到达时间', '运行时间', '余票情况', '票价'].forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table2.appendChild(thead);

        // 创建表身
        const tbody = document.createElement('tbody');
        trains_info.forEach(train => {
            const row = document.createElement('tr');
            ['departure_station', 'arrival_station', 'departure_time', 'arrival_time', 'other_info', 'ticket_information', 'price'].forEach(key => {
                const cell = document.createElement('td');
                cell.textContent = train[key];
                row.appendChild(cell);
            });
            tbody.appendChild(row);
        });
        table2.appendChild(tbody);

        // 将表格添加到容器
        container.appendChild(table2);


        // 删除加载动画
        const loadMsg = document.getElementById('cssLoader1');
        if (loadMsg && loadMsg.parentNode) {
            loadMsg.parentNode.removeChild(loadMsg);
        }

        // 添加工具栏
        /*addToolbar(llmMsg_P);

        function createContainer() {
            const container = document.createElement('p');
            container.id = 'llmMsg';
            container.style.display = 'block'; // 确保容器可见
            document.body.appendChild(container); // 或者您希望放置容器的位置
            return container;
        }

        function addToolbar(element) {
            const llmMsg_toolbar = document.createElement("div");
            llmMsg_toolbar.className = "tool-bar";

            let toolbarHTML = `
                <span class="iconfont icon-fuzhi"></span>
                <span class="iconfont icon-shuaxin"></span>
                <span class="iconfont icon-cai"></span>
            `;

            llmMsg_toolbar.innerHTML = toolbarHTML;
            element.appendChild(llmMsg_toolbar);
        }*/
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });

    /*fetch('http://127.0.0.1:8000/generate_response', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData) // 直接使用构造好的请求体
    })
    .then(response => {
        if (response.ok) {
            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            const res = llmMsg_P;

            //我们的大模型不需要输出json
            function read() {
                reader.read().then(({ done, value }) => {
                    if (done) {
                        //删除加载动画
                        const loadMsg = document.getElementById('cssLoader1');
                        if (loadMsg && loadMsg.parentNode) {
                            loadMsg.parentNode.removeChild(loadMsg);
                        }

                        console.log('Stream closed');
                        const llmMsg_toolbar = document.createElement("div");
                        llmMsg_toolbar.className = "tool-bar"

                        // 使用模板字符串和JavaScript来构建HTML
                        let toolbarHTML = `
                            <span class="iconfont icon-fuzhi""></span>
                            <span class="iconfont icon-shuaxin"></span>
                            <span class="iconfont icon-cai"></span>
                        `;

                        // 使用innerHTML设置生成的HTML
                        llmMsg_toolbar.innerHTML = toolbarHTML;

                        llmMsg.appendChild(llmMsg_toolbar);
                        return;
                    }

                    const chunk = decoder.decode(value, { stream: true });
                    // console.log(1000,chunk.split('\r\n'))
                    chunk.split('\r\n').forEach(eventString => {
                        // console.log(1000,eventString);
                        if (eventString && eventString.startsWith('data: ')) {
                            // console.log(2000,eventString);
                            const str = eventString.substring("data: ".length);
                            //res.innerHTML += str + '<br>'; // 追加数据和换行符
                            const data = JSON.parse(str)
                            // console.log(3000,data);
                            for(const item of data.ops){
                                if(item.op === "add" && item.path === "/logs/ChatOpenAI/streamed_output_str/-"){
                                    // console.log(item.value)
                                    res.innerHTML += item.value;  
                                }
                                if(item.op === "add" && item.path === "/logs/PydanticToolsParser/final_output"){
                                    if(String(item.value.output) !== "null" && String(item.value.output) !== "undefined"){
                                        // console.log(JSON.stringify(item.value.output, null, 2))
                                        res.innerHTML += item.value;
                                        //res.innerHTML = `<pre>${JSON.stringify(item.value.output, null, 2)}</pre>`;
                                        break;
                                    }
                                }
                            }
                        }
                    });
                    

                    read();
                }).catch(error => {
                    console.error('Stream error', error);
                });
            }

            read();
        } else {
            console.error('Network response was not ok.');
        }
    }).catch(error => {
        console.error('Fetch error:', error);
    });*/
}

//新增的删除函数
function removeIntroduction() {
    const introduction = document.getElementById('introduction');
    if (introduction && introduction.parentNode) {
        introduction.parentNode.removeChild(introduction);
    }
}

//清空输入框内容
function clearInput() {
    var inputElement = document.getElementById('input-chat');
    if (inputElement) {
        inputElement.value = '';
        document.querySelector('#input-send').classList.remove('active')
    }
}

