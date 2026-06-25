<?xml version="1.0" encoding="UTF-8"?>
<WebServiceRequestEntity>
   <description></description>
   <name>Casual Check-out</name>
   <tag></tag>
   <elementGuidId>7b5222b5-277b-46e8-ad91-b8a7af0765f3</elementGuidId>
   <selectorMethod>BASIC</selectorMethod>
   <smartLocatorEnabled>false</smartLocatorEnabled>
   <useRalativeImagePath>false</useRalativeImagePath>
   <authorizationRequest>
      <authorizationInfo>
         <entry>
            <key>bearerToken</key>
            <value>eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzdGFmZiIsInJvbGVzIjpbIlJPTEVfU1RBRkYiXSwiaWF0IjoxNzgyMzY2NTA5LCJleHAiOjE3ODMyMzA1MDl9.20AX7eH4hYsCVytSImL1J97e7Pfd9nUC9EPdheLn0v8</value>
         </entry>
      </authorizationInfo>
      <authorizationType>Bearer</authorizationType>
   </authorizationRequest>
   <autoUpdateContent>true</autoUpdateContent>
   <connectionTimeout>0</connectionTimeout>
   <followRedirects>true</followRedirects>
   <httpBody></httpBody>
   <httpBodyContent>{
  &quot;text&quot;: &quot;&quot;,
  &quot;contentType&quot;: &quot;text/plain&quot;,
  &quot;charset&quot;: &quot;UTF-8&quot;
}</httpBodyContent>
   <httpBodyType>text</httpBodyType>
   <httpHeaderProperties>
      <isSelected>true</isSelected>
      <matchCondition>equals</matchCondition>
      <name>Authorization</name>
      <type>Main</type>
      <value>Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzdGFmZiIsInJvbGVzIjpbIlJPTEVfU1RBRkYiXSwiaWF0IjoxNzgyMzY2NTA5LCJleHAiOjE3ODMyMzA1MDl9.20AX7eH4hYsCVytSImL1J97e7Pfd9nUC9EPdheLn0v8</value>
      <webElementGuid>7f66e90e-0d2f-4f8c-a333-cda348ffb87d</webElementGuid>
   </httpHeaderProperties>
   <httpHeaderProperties>
      <isSelected>true</isSelected>
      <matchCondition>equals</matchCondition>
      <name>Content-Type</name>
      <type>Main</type>
      <value>application/json</value>
      <webElementGuid>3e76fad9-50ab-46bf-a78b-a4842217c57b</webElementGuid>
   </httpHeaderProperties>
   <katalonVersion>11.2.1</katalonVersion>
   <maxResponseSize>0</maxResponseSize>
   <migratedVersion>5.4.1</migratedVersion>
   <path></path>
   <restRequestMethod>POST</restRequestMethod>
   <restUrl>http://localhost:8080/api/v1/parking/checkout/${identifier}</restUrl>
   <serviceType>RESTful</serviceType>
   <soapBody></soapBody>
   <soapHeader></soapHeader>
   <soapRequestMethod></soapRequestMethod>
   <soapServiceEndpoint></soapServiceEndpoint>
   <soapServiceFunction></soapServiceFunction>
   <socketTimeout>0</socketTimeout>
   <useServiceInfoFromWsdl>true</useServiceInfoFromWsdl>
   <variables>
      <defaultValue>''</defaultValue>
      <description></description>
      <id>1e02dc81-0d08-4ef8-b1df-ac3ef30df696</id>
      <masked>false</masked>
      <name>token</name>
   </variables>
   <variables>
      <defaultValue>'${GlobalVariable.currentIdentifier}'</defaultValue>
      <description></description>
      <id>1e02dc81-0d08-4ef8-b1df-ac3ef30df695</id>
      <masked>false</masked>
      <name>identifier</name>
   </variables>
   <verificationScript>import static org.assertj.core.api.Assertions.*
import com.kms.katalon.core.testobject.ResponseObject
import com.kms.katalon.core.webservice.keyword.WSBuiltInKeywords as WS
import com.kms.katalon.core.webservice.verification.WSResponseManager

// 1. Lấy response hiện tại
ResponseObject response = WSResponseManager.getInstance().getCurrentResponse()

// 2. Kiểm tra Status Code
// Nếu API bị 403 hay 409, nó sẽ in ra lỗi ở đây cho ông thấy
int statusCode = response.getStatusCode()
println(&quot;DEBUG: HTTP Status Code là: &quot; + statusCode)

if (statusCode == 403) {
    println(&quot;❌ LỖI: 403 Forbidden! Token bị thiếu, sai hoặc không có quyền STAFF.&quot;)
} else if (statusCode == 409) {
    println(&quot;❌ LỖI: 409 Conflict! Transaction này đã bị xử lý hoặc dữ liệu bị trùng.&quot;)
} else if (statusCode == 200) {
    println(&quot;✅ THÀNH CÔNG: API trả về 200 OK.&quot;)
}

// 3. Kiểm tra nội dung response (nếu cần)
String responseBody = response.getResponseText()
println(&quot;DEBUG: Response body là: &quot; + responseBody)</verificationScript>
   <wsdlAddress></wsdlAddress>
</WebServiceRequestEntity>
