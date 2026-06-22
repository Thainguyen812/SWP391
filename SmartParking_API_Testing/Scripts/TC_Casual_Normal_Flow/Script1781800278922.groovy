import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import com.kms.katalon.core.webservice.keyword.WSBuiltInKeywords as WS
import groovy.json.JsonSlurper

// Đăng nhập Staff để lấy Token xác thực trước
def loginResponse = WS.sendRequest(findTestObject('Object Repository/User Login', [
    'username': 'staff',
    'password': '123456'
]))
WS.verifyResponseStatusCode(loginResponse, 200)
def loginJson = new JsonSlurper().parseText(loginResponse.getResponseBodyContent())
String staffToken = loginJson.accessToken
println("Đăng nhập Staff thành công. Token: " + staffToken)

// Bước 0: Dọn dẹp dữ liệu thử nghiệm để tránh lỗi 409
WS.sendRequest(findTestObject('Object Repository/POST - Cleanup', [
    'token': staffToken
]))

// Bước 1: Khách vãng lai quét thẻ tại làn vào để Check-in
def checkInResponse = WS.sendRequest(findTestObject('Object Repository/Casual Check-in', [
    'cardCode': '000001',
    'plate': '29A-88888',
    'vehicleType': 'FAMILY_CAR',
    'imageUrl': 'http://mock-storage/casual_in.jpg',
    'token': staffToken
]))
WS.verifyResponseStatusCode(checkInResponse, 201)
def checkInJson = new JsonSlurper().parseText(checkInResponse.getResponseBodyContent())
assert checkInJson.session_id != null && checkInJson.session_id != ""
println("Check-in Casual thành công. Session ID: " + checkInJson.session_id)

// Bước 1.5: Lấy dynamic cardId từ session vừa tạo
def sessionResponse = WS.sendRequest(findTestObject('Object Repository/Smart Parking Building API/api_sessions_id/get_2', [
    'id': checkInJson.session_id,
    'token': staffToken
]))
WS.verifyResponseStatusCode(sessionResponse, 200)
def sessionJson = new JsonSlurper().parseText(sessionResponse.getResponseBodyContent())
String dynamicCardId = sessionJson.cardId
println("Lấy dynamic cardId từ Session thành công: " + dynamicCardId)

// Bước 2: Khách vãng lai quét thẻ tại làn ra để Check-out (sử dụng ID của thẻ 000001)
def checkOutResponse = WS.sendRequest(findTestObject('Object Repository/Casual Check-out', [
    'cardId': dynamicCardId,
    'token': staffToken
]))
WS.verifyResponseStatusCode(checkOutResponse, 200)
def checkOutJson = new JsonSlurper().parseText(checkOutResponse.getResponseBodyContent())
WS.verifyEqual(checkOutJson.paymentStatus, 'PENDING')
println("Check-out Casual thành công. Số tiền cần thanh toán: " + checkOutJson.totalAmount)
