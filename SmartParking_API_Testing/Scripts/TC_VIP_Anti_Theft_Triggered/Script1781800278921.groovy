import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import com.kms.katalon.core.webservice.keyword.WSBuiltInKeywords as WS
import groovy.json.JsonSlurper

// Bước 1: Driver VIP đăng nhập App trước
def loginResponse = WS.sendRequest(findTestObject('Object Repository/User Login', [
    'username': 'driver_vip',
    'password': '123456'
]))
WS.verifyResponseStatusCode(loginResponse, 200)
def loginJson = new JsonSlurper().parseText(loginResponse.getResponseBodyContent())
String jwtToken = loginJson.accessToken
println("Đăng nhập Driver VIP thành công. Token: " + jwtToken)

// Bước 2: Dọn dẹp dữ liệu thử nghiệm để tránh lỗi 409 (Truyền token)
WS.sendRequest(findTestObject('Object Repository/POST - Cleanup', [
    'token': jwtToken
]))

// Bước 3: Cho xe VIP check-in vào bãi (Truyền token)
def checkInResponse = WS.sendRequest(findTestObject('Object Repository/Check-in AI', [
    'plate': '30A-99999',
    'confidence': 95.0,
    'vehicleType': 'FAMILY_CAR',
    'imageUrl': 'http://mock-storage/30A-99999_in.jpg',
    'token': jwtToken
]))
WS.verifyResponseStatusCode(checkInResponse, 201)

// Bước 4: Driver kích hoạt Khóa xe an toàn (is_locked = TRUE)
// Gọi API PUT /api/v1/driver/vehicle/lock
def lockResponse = WS.sendRequest(findTestObject('Object Repository/PUT - Lock Vehicle', [
    'token': jwtToken,
    'vehicleId': 'b0000000-0000-0000-0000-000000000001',
    'lockStatus': true
]))
WS.verifyResponseStatusCode(lockResponse, 200)

// Bước 5: Tài xế sinh mã QR xuất bãi
def qrResponse = WS.sendRequest(findTestObject('Object Repository/POST - Generate VIP QR', [
    'token': jwtToken,
    'vehicleId': 'b0000000-0000-0000-0000-000000000001'
]))
def qrJson = new JsonSlurper().parseText(qrResponse.getResponseBodyContent())
String qrToken = qrJson.qrToken

// Bước 6: Kẻ gian/tài xế quét QR xuất bãi tại làn ra (Truyền token)
def checkOutResponse = WS.sendRequest(findTestObject('Object Repository/Verify Exit QR (VIP Check-out)', [
    'plate': '30A-99999',
    'qrToken': qrToken,
    'token': jwtToken
]))

// Hệ thống phải trả về mã lỗi 403 Forbidden (Chặn Barie)
WS.verifyResponseStatusCode(checkOutResponse, 403)
def errorJson = new JsonSlurper().parseText(checkOutResponse.getResponseBodyContent())
WS.verifyEqual(errorJson.message, 'Xe đang ở trạng thái KHÓA AN TOÀN chống trộm! Không thể xuất bãi.')
println("Test Pass: Hệ thống đã chặn xe và phát tín hiệu còi hú báo động!")

// ========================================================
// TỰ ĐỘNG DỌN DẸP DỮ LIỆU ĐỂ HỖ TRỢ CHẠY LẠI (SELF-HEALING)
// ========================================================
// Bước 7: Tài xế mở khoá xe trên App di động
def unlockResponse = WS.sendRequest(findTestObject('Object Repository/PUT - Lock Vehicle', [
    'token': jwtToken,
    'vehicleId': 'b0000000-0000-0000-0000-000000000001',
    'lockStatus': false
]))
WS.verifyResponseStatusCode(unlockResponse, 200)

// Bước 8: Quét lại mã QR tại làn ra -> Cho phép xe ra cổng bình thường để giải phóng session (Truyền token)
def checkOutCleanResponse = WS.sendRequest(findTestObject('Object Repository/Verify Exit QR (VIP Check-out)', [
    'plate': '30A-99999',
    'qrToken': qrToken,
    'token': jwtToken
]))
WS.verifyResponseStatusCode(checkOutCleanResponse, 200)
println("Dọn dẹp database thành công: Đã hoàn thành phiên đỗ xe sau khi mở khoá.")
