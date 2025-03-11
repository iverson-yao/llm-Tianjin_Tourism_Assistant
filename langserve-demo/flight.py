from bs4 import BeautifulSoup
from DrissionPage import WebPage
from time import sleep

def FlightsPage(departurePlace, arrivePlace, departureDate):
    page = WebPage()
    page.get('https://flights.ctrip.com/online/list/oneway-' + departurePlace + '-' + arrivePlace + '?depdate=' + departureDate + '&cabin=y_s_c_f&adult=1&child=0&infant=0')
    page('#filter_item_other').click()
    sleep(1)
    page("@@u_key=filter_toggle_entry@@u_remark=点击筛选项[FILTER_GROUP_OTHER.HIDE_SHARED_FLIGHTS/隐藏共享航班]").click()
    for i in range(4):
        sleep(3)
        page.scroll.to_bottom()
    sleep(1)
    soup = BeautifulSoup(page.html, "html.parser")
    return soup

def AirlineNameDiv(FlightsDiv):
    return FlightsDiv.find_all("div", {"class": "airline-name"})

def AirlineNameDivFirst(FlightsDiv):
    return FlightsDiv.find_all("div", {"class": "airline-name"})

def GetDpDiv(FlightsDiv):
    return FlightsDiv.find("div", {"class": "depart-box"})

def GetArrDiv(FlightsDiv):
    return FlightsDiv.find("div", {"class": "arrive-box"})

def GetDpAirport(FlightsDiv):
    return GetDpDiv(FlightsDiv).find("div", {"class": "airport"}).text

def GetDpTime(FlightsDiv):
    return GetDpDiv(FlightsDiv).find("div", {"class": "time"}).text

def GetArrAirport(FlightsDiv):
    return GetArrDiv(FlightsDiv).find("div", {"class": "airport"}).text

def GetArrTime(FlightsDiv):
    return GetArrDiv(FlightsDiv).find("div", {"class": "time"}).text

def GetFlightInformation(FlightsDiv):
    return FlightsDiv.find("div", {"class": "transfer-info-group"}).text

def GetFlightPrice(FlightsDiv):
    return FlightsDiv.find("span", {"class": "price"}).text

def ReviseResult(FlightsDiv, airlineName):
    result = {
        'airline': 'null',
        'departure_airport': 'null',
        'arrival_airport': 'null',
        'departure_time': 'null',
        'arrival_time': 'null',
        'FlightInformation': 'null',
        'price': 'null'
    }
    result['airline'] = airlineName
    result['departure_airport'] = GetDpAirport(FlightsDiv)
    result['arrival_airport'] = GetArrAirport(FlightsDiv)
    result['departure_time'] = GetDpTime(FlightsDiv)
    result['arrival_time'] = GetArrTime(FlightsDiv)
    result['FlightInformation'] = GetFlightInformation(FlightsDiv)
    result['price'] = GetFlightPrice(FlightsDiv)
    return result

def DataProcessing(FlightsDiv):
    airline_names = AirlineNameDivFirst(FlightsDiv)
    if not airline_names:
        # print("Error: No airline names found.")
        # print("FlightsDiv content:", FlightsDiv)
        return None
    if len(airline_names) == 2:
        return ReviseResult(FlightsDiv, [airline_names[0].contents[0], airline_names[1].contents[0]])
    return ReviseResult(FlightsDiv, airline_names[0].text)
    # if len(AirlineNameDiv(FlightsDiv)) == 2 :
    #   return  ReviseResult(FlightsDiv,[AirlineNameDiv(FlightsDiv)[0].contents[0],AirlineNameDiv(FlightsDiv)[1].contents[0]])
    # if len(AirlineNameDiv(FlightsDiv)) == 0 :
    #   return  ReviseResult(FlightsDiv,AirlineNameDivFirst(FlightsDiv)[0].text)

def AllFlights(allFlightsDiv):
    r=[]
    for FlightsDiv in allFlightsDiv:
        result = DataProcessing(FlightsDiv)
        if result:
            # print(result)
            r.append(result)
    return r

# 'sha'为出发地，'tsn'为到达地，'2024-7-20'为出发日期
# FlightsDiv = FlightsPage('sha', 'tsn', '2024-7-20').find_all("div", {"class": "flight-box"})
# print("FlightsDiv:", FlightsDiv)  # 调试语句检查 FlightsDiv 内容
# AllFlights(FlightsDiv)
# AllFlights(FlightsPage('sha','tsn','2024-7-22').find_all("div",{"class":"flight-box"}))
# print(AllFlights(FlightsPage('sha','tsn','2024-7-25').find_all("div",{"class":"flight-box"})))

