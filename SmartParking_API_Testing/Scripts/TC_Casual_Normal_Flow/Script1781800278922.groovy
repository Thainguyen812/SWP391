import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import com.kms.katalon.core.webservice.keyword.WSBuiltInKeywords as WS
import groovy.json.JsonSlurper as JsonSlurper
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import com.kms.katalon.core.mobile.keyword.MobileBuiltInKeywords as Mobile
import com.kms.katalon.core.cucumber.keyword.CucumberBuiltinKeywords as CucumberKW
import com.kms.katalon.core.windows.keyword.WindowsBuiltinKeywords as Windows
import static com.kms.katalon.core.testobject.ObjectRepository.findWindowsObject
import static com.kms.katalon.core.testdata.TestDataFactory.findTestData
import static com.kms.katalon.core.testcase.TestCaseFactory.findTestCase
import static com.kms.katalon.core.checkpoint.CheckpointFactory.findCheckpoint
import com.kms.katalon.core.model.FailureHandling as FailureHandling
import com.kms.katalon.core.testcase.TestCase as TestCase
import com.kms.katalon.core.testdata.TestData as TestData
import com.kms.katalon.core.testobject.TestObject as TestObject
import com.kms.katalon.core.checkpoint.Checkpoint as Checkpoint
import org.openqa.selenium.Keys as Keys
import internal.GlobalVariable as GlobalVariable

// Đăng nhập Staff để lấy Token xác thực trước
def loginResponse = WS.sendRequest(findTestObject('Object Repository/User Login', [('username') : 'staff', ('password') : '123456']))

WS.verifyResponseStatusCode(loginResponse, 200)

def loginJson = new JsonSlurper().parseText(loginResponse.getResponseBodyContent())

String staffToken = loginJson.accessToken

println('Đăng nhập Staff thành công. Token: ' + staffToken)

// Bước 0: Dọn dẹp dữ liệu thử nghiệm để tránh lỗi 409
WS.sendRequest(findTestObject('POST - Cleanup', [('token') : staffToken]))

// Bước 1: Khách vãng lai quét thẻ tại làn vào để Check-in
def checkInResponse = WS.sendRequest(findTestObject('Casual Check-in', [('token') : staffToken]))

WS.verifyResponseStatusCode(checkInResponse, 201)

def checkInJson = new JsonSlurper().parseText(checkInResponse.getResponseBodyContent())

assert (checkInJson.session_id != null) && (checkInJson.session_id != '')

println("======> JSON LÚC CHECKIN: " + checkInResponse.getResponseBodyContent())

println('Check-in Casual thành công. Session ID: ' + checkInJson.session_id)

// Bước 1.5: Gửi request lấy thông tin Session
def sessionResponse = WS.sendRequest(findTestObject('Smart Parking Building API/api_sessions_id/get_2', [('id') : checkInJson.session_id, ('token') : staffToken]))

WS.verifyResponseStatusCode(sessionResponse, 200)

// ÉP KIỂU CHUẨN: Sử dụng đường dẫn package đầy đủ của Groovy để đảm bảo không bị null object
def slurper = new groovy.json.JsonSlurper()
def sessionJson = slurper.parseText(sessionResponse.getResponseBodyContent())

// IN THỬ RA CONSOLE ĐỂ KIỂM TRA MẮT THƯỜNG (Có lỗi nhìn phát biết ngay)
println('======> DỮ LIỆU THỰC TẾ BACKEND TRẢ VỀ: ' + sessionResponse.getResponseBodyContent())


// Dùng toán tử an toàn ?. để quét sạch tất cả các khả năng đặt tên trường của Dev backend
String dynamicCardId = sessionJson?.cardId ?: sessionJson?.card_id ?: sessionJson?.card?.id
dynamicVehicleType = "MINIBUS_16"

println('======> Lấy dynamic cardId thành công: ' + dynamicCardId)
println("======> LOẠI XE ĐANG CHECK-OUT: '" + sessionJson.vehicleType + "'")
// Bước 2: Khách vãng lai quét thẻ tại làn ra để Check-out (sử dụng ID của thẻ 000001)
def checkOutResponse = WS.sendRequest(findTestObject('Casual Check-out', [('token') : staffToken,('cardId') : dynamicCardId, "vehicleType": dynamicVehicleType]))

println("======> LÝ DO LỖI 400 (CHECKOUT): " + checkOutResponse.getResponseBodyContent())
WS.verifyResponseStatusCode(checkOutResponse, 200)

def checkOutJson = new JsonSlurper().parseText(checkOutResponse.getResponseBodyContent())

WS.verifyEqual(checkOutJson.paymentStatus, 'PENDING')

println('Check-out Casual thành công. Số tiền cần thanh toán: ' + checkOutJson.totalAmount)

