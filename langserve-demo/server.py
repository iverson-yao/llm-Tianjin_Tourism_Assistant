from typing import List

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_community.chat_models import ChatZhipuAI
from langserve import add_routes
from dotenv import load_dotenv,find_dotenv
from router_api import router
from llm import generate_response
from pydantic import BaseModel

# 1. Create prompt template
system_template = "Translate the following into {language}:"
prompt_template = ChatPromptTemplate.from_messages([
    ("system",system_template),
    ("user","{text}")
])

# 2 获取你的智谱 API Key
_ = load_dotenv(find_dotenv())

# 6. App definition
app = FastAPI(
    title="LangServe Demo",
    description="使用 LangChain 的 Runnable 接口的简单 API 服务器",
    version="0.0.1"
)


# 8. Publishing static resources
app.mount("/pages",StaticFiles(directory="static"),name="pages")

session_states = {}

class GenerateResponseRequest(BaseModel):
    session_id: str
    user_input: str

@app.post("/generate_response")
async def generate_response_route(request_data: GenerateResponseRequest):
    print('接受成功')
    session_id = request_data.session_id
    user_input = request_data.user_input
    # 获取当前会话的状态
    session_state = session_states.get(session_id, {})

    # 如果状态不存在，则初始化状态
    if 'dp' not in session_state or 'ds' not in session_state or 'da' not in session_state:
        session_state['dp'] = None
        session_state['ds'] = None
        session_state['da'] = None

    # 调用你的generate_response函数
    response, dp, ds, da, flights_info, trains_info = generate_response(session_id, user_input,
                                             session_state['dp'], session_state['ds'], session_state['da'])

    # 更新会话状态
    session_state.update({'dp': dp, 'ds': ds, 'da': da})
    session_states[session_id] = session_state

    return {"response": response, "flights_info": flights_info, "trains_info": trains_info}

# 9. cors跨域
from fastapi.middleware.cors import CORSMiddleware
# 允许所有来源访问，允许所有方法和标头
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

#10 get api
@app.get("/baike")
def baike(action,list,srsearch,format):
    print(action,list,srsearch,format)
    return {"query":{
        "search":[
            {"snippet":"xxxxxxx"}
        ]
    }}

#11 加载自定义路由
app.include_router(router)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)


"""
python serve.py

每个 LangServe 服务都带有一个简单的内置 UI，用于配置和调用应用程序，并提供流式输出和中间步骤的可见性。
前往 http://localhost:8000/chain/playground/ 试用！
传入与之前相同的输入 - {"language": "chinese", "text": "hi"} - 它应该会像以前一样做出响应。
"""