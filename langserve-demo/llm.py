from zhipuai import ZhipuAI
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.messages import HumanMessage, AIMessage
import re
import os
from dotenv import load_dotenv, find_dotenv
from bs4 import BeautifulSoup
from DrissionPage import WebPage
from time import sleep
from urllib.parse import quote
import flight
import TrainTickets
from embedText import embedText

# 加载环境变量
_ = load_dotenv(find_dotenv())
filepath='./res/天津市10大景点.html'

# 获取 API 密钥


# 配置 ZhipuAI
client = ZhipuAI(api_key="REMOVED_EXPOSED_API_KEY")

# 创建一个存储用于保存会话历史记录
store = {}

# 获取会话历史记录的函数
def get_session_history(session_id: str) -> BaseChatMessageHistory:
    if session_id not in store:
        store[session_id] = ChatMessageHistory()
    return store[session_id]

# 定义一个自定义的函数来生成文本
def generate_text_with_zhipuai(prompt: str, session_id: str) -> str:
    chat_history = get_session_history(session_id)
    messages = [{"role": "system", "content": "你是一个旅游助手，请帮助用户提供旅游信息。"}]
    for msg in chat_history.messages:
        if isinstance(msg, HumanMessage):
            messages.append({"role": "user", "content": msg.content})
        elif isinstance(msg, AIMessage):
            messages.append({"role": "assistant", "content": msg.content})
    ###
    # inform='提示信息：'+embedText(prompt,file_path=filepath)+'请参考与提示信息相关的资料，回答问题：'
    inform = '请回答问题：'
    prompt=inform+prompt
    ###
    messages.append({"role": "user", "content": prompt})
    
    completion = client.chat.completions.create(
        model="glm-4",
        messages=messages
    )
    response = completion.choices[0].message.content
    chat_history.add_message(AIMessage(content=response))
    return response

# def parse_user_input(user_input, session_id):
#     prompt = f"从下面的文本中提取出发地、目的地和出发时间，出发地和目的地要替换成航班信息中的英文简写，如上海就是SHA，天津就是TSN，时间格式类似2024-7-01,今天是2024-7-24：\n{user_input}\n\n输出格式为：出发地：<出发地>，目的地：<目的地>，出发时间：<出发时间>,严格按照我的格式来，多的不要"
#     result = generate_text_with_zhipuai(prompt, session_id)
#     departure_match = re.search(r'出发地：([^，]+)', result)
#     destination_match = re.search(r'目的地：([^，]+)', result)
#     departure_date_match = re.search(r'出发时间：(.+)', result)
#     if departure_match and destination_match and departure_date_match:
#         departure = departure_match.group(1)
#         destination = destination_match.group(1)
#         departure_date = departure_date_match.group(1)
#         return departure, destination, departure_date
#     else:
#         return None, None, None
def parse_user_input(user_input, session_id):
    # 指示智谱AI同时提供中文和英文格式的出发地和目的地
    prompt = f"从下面的文本中提取出发地、目的地以及对应的英文简写，以及出发时间,今天是2024-7-24。请严格按照以下格式提供信息，不要有括号等补充：\n出发地：中文地名（英文简写），目的地：中文地名（英文简写），出发时间：YYYY-MM-DD\n例如：出发地：上海(SHA)，目的地：天津(TSN)，出发时间：2024-07-01\n输入文本：\n{user_input}"    
    result = generate_text_with_zhipuai(prompt, session_id)
    
    # 使用正则表达式匹配中文地名和对应的英文简写
    pattern = (r'出发地：([^（]+)\(([^）]+)\)，目的地：([^（]+)\(([^）]+)\)，出发时间：(.+)')
    match = re.search(pattern, result)
    
    if match:
        departure_chinese = match.group(1)
        departure_english = match.group(2)
        destination_chinese = match.group(3)
        destination_english = match.group(4)
        departure_date = match.group(5)
        
        return departure_chinese, departure_english, destination_chinese, destination_english, departure_date
    else:
        return None, None, None, None, None

# def get_travel_info(departure, destination, departure_date):
#     flights_info = AllFlights(FlightsPage(departure, destination, departure_date).find_all("div", {"class": "flight-box"}))
#     trains_info = AllTrains(GetTrainPage(departure, destination, departure_date).find("section", {"role": "product"}).find_all("div", {"class": "list-bd"}))
#     return flights_info, trains_info
# dp=''
# ds=''
# da=''
# def generate_response(session_id, user_input, dp=None, ds=None, da=None):
#     chat_history = get_session_history(session_id)
#     chat_history.add_message(HumanMessage(content=user_input))
#     departure, destination, departure_date = parse_user_input(user_input, session_id)
#     print(departure, destination, departure_date)
#     if (departure_date and destination and departure_date and (departure != dp or destination != ds or departure_date != da)):
#         dp = departure
#         ds = destination
#         da = departure_date
#         print(AllFlights(FlightsPage(departure,destination,departure_date).find_all("div",{"class":"flight-box"})))
#         # print(AllTrains(GetTrainPage(departure,destination,departure_date).find("section",{"role":"product"}).find_all("div",{"class":"list-bd"})))
#     # try:
#     #     departure, destination, departure_date = parse_user_input(user_input, session_id)
#     #     if departure and destination and departure_date:
#     #         flights_info, trains_info = get_travel_info(departure, destination, departure_date)
#     #         travel_info_content = f"从{departure}到{destination}在{departure_date}的出行信息如下：\n航班信息：{flights_info}\n火车票信息：{trains_info}"
#     #         regular_response_content = generate_text_with_zhipuai(user_input, session_id)
#     #         response_content = f"{regular_response_content}\n\n{travel_info_content}"
#     #     else:
#     #         response_content = generate_text_with_zhipuai(user_input, session_id)
#     # except Exception as e:
#     #     print(f"Error occurred: {e}")
#     #     print(departure, destination, departure_date)
#     #     response_content = generate_text_with_zhipuai(user_input, session_id)
#     response_content = generate_text_with_zhipuai(user_input, session_id)
#     chat_history.add_message(HumanMessage(content=response_content))
    
#     return response_content, dp, ds, da
def generate_response(session_id, user_input, dp=None, ds=None, da=None):
    chat_history = get_session_history(session_id)
    chat_history.add_message(HumanMessage(content=user_input))
    current_departure_c, current_departure_e, current_destination_c, current_destination_e, current_departure_date = parse_user_input(user_input, session_id)
    print(current_departure_e, current_destination_e, current_departure_date)

    flights_info = []
    trains_info = []
    # 检查是否需要新的查询
    need_new_query = (current_departure_e != dp or current_destination_e != ds or current_departure_date != da)
    if need_new_query:
        # print("查询新的航班信息...")
        flights_info = flight.AllFlights(flight.FlightsPage(current_departure_e, current_destination_e, current_departure_date).find_all("div", {"class": "flight-box"}))
        trains_info = TrainTickets.AllTrains(TrainTickets.GetTrainPage(current_departure_c,current_destination_c,current_departure_date).find("section",{"role":"product"}).find_all("div",{"class":"list-bd"}))
        #print(flights_info)
        #print(trains_info)
        flights_info = flights_info[0:3]
        trains_info = trains_info[0:3]
        # 更新缓存变量
        dp, ds, da = current_departure_e, current_destination_e, current_departure_date

    response_content = generate_text_with_zhipuai(user_input, session_id)
    chat_history.add_message(HumanMessage(content=response_content))
    
    return response_content, dp, ds, da, flights_info, trains_info

# 使用示例
'''
session_id = "session_1"
user_input = "我明天从上海来天津玩两天"
response, dp, ds, da, flights_info, trains_info = generate_response(session_id, user_input)
print(response)

print(flights_info)

print(trains_info)

session_id = "session_1"
user_input = "我刚刚和你说我从哪里出发来着"
response, dp, ds, da, flights_info, trains_info = generate_response(session_id, user_input, dp, ds, da)
print(response)
'''
