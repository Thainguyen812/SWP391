import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import com.kms.katalon.core.webservice.keyword.WSBuiltInKeywords as WS
import groovy.json.JsonSlurper

// Bước 1: Tài xế VIP thực hiện Đăng nhập vào App di động để lấy Token xác thực trước
def loginResponse = WS.sendRequest(findTestObject('Object Repository/User Login', [
    'username': 'driver_vip',
    'password': '123456'
]))
WS.verifyResponseStatusCode(loginResponse, 200)
def loginJson = new JsonSlurper().parseText(loginResponse.getResponseBodyContent())
String jwtToken = loginJson.accessToken
println("Đăng nhập Driver VIP thành công. JWT Token: " + jwtToken)

// Bước 2: Dọn dẹp dữ liệu thử nghiệm để tránh lỗi 409 (Truyền token)
WS.sendRequest(findTestObject('Object Repository/POST - Cleanup', [
    'token': jwtToken
]))

// Bước 3: Giả lập AI Camera quét biển số xe VIP lúc VÀO BÃI (Check-in, Truyền token)
def checkInResponse = WS.sendRequest(findTestObject('Object Repository/Check-in AI', [
    'plate': '30A-99999',
    'confidence': 95.0,
    'vehicleType': 'FAMILY_CAR',
    'imageUrl': 'http://mock-storage/30A-99999_in.jpg',
    'token': jwtToken
]))
WS.verifyResponseStatusCode(checkInResponse, 201)
def checkInJson = new JsonSlurper().parseText(checkInResponse.getResponseBodyContent())
assert checkInJson.session_id != null && checkInJson.session_id != ""
println("Check-in VIP thành công. Session ID: " + checkInJson.session_id)

// Bước 4: Tài xế sinh mã QR Động Xuất Bãi trên App
def qrResponse = WS.sendRequest(findTestObject('Object Repository/POST - Generate VIP QR', [
    'token': jwtToken,
    'vehicleId': 'b0000000-0000-0000-0000-000000000001'
]))
WS.verifyResponseStatusCode(qrResponse, 201)
def qrJson = new JsonSlurper().parseText(qrResponse.getResponseBodyContent())
String qrToken = qrJson.qrToken
println("Sinh mã QR động xuất bãi thành công. QR Token: " + qrToken)

// Bước 5: Tài xế quét mã QR tại Làn Ra để Check-out (Xác thực MFA, Truyền token)
def checkOutResponse = WS.sendRequest(findTestObject('Object Repository/Verify Exit QR (VIP Check-out)', [
    'plate': '30A-99999',
    'qrToken': qrToken,
    'token': jwtToken
]))
WS.verifyResponseStatusCode(checkOutResponse, 200)
WS.verifyEqual(checkOutResponse.getResponseBodyContent(), 'MATCH — VIP QR EXIT')
println("Check-out VIP hoàn tất. Barrier mở!")