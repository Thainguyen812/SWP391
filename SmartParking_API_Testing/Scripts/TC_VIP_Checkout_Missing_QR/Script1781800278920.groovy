import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import com.kms.katalon.core.webservice.keyword.WSBuiltInKeywords as WS
import groovy.json.JsonSlurper

// Đăng nhập Driver VIP
def loginResponse = WS.sendRequest(findTestObject('Object Repository/User Login', [
    'username': 'driver_vip',
    'password': '123456'
]))
WS.verifyResponseStatusCode(loginResponse, 200)
def loginJson = new JsonSlurper().parseText(loginResponse.getResponseBodyContent())
String jwtToken = loginJson.accessToken

// Gửi request check-out VIP thiếu mã QR token (Truyền token)
def response = WS.sendRequest(findTestObject('Object Repository/Verify Exit QR (VIP Check-out)', [
    'plate': '30A-99999',
    'qrToken': '', // Bỏ trống mã QR
    'token': jwtToken
]))

// Hệ thống phải báo lỗi Bad Request (400) hoặc Unprocessable Entity
WS.verifyResponseStatusCode(response, 400)
println("Test Pass: Hệ thống chặn thành công xe VIP check-out không mang QR.")
