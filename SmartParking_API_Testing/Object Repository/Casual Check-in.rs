<?xml version="1.0" encoding="UTF-8"?>
<WebServiceRequestEntity>
   <description></description>
   <name>Casual Check-in</name>
   <tag></tag>
   <elementGuidId>cf1ec021-5e0c-4153-a62c-044ead65c4e3</elementGuidId>
   <selectorMethod>BASIC</selectorMethod>
   <smartLocatorEnabled>false</smartLocatorEnabled>
   <useRalativeImagePath>false</useRalativeImagePath>
   <authorizationRequest>
      <authorizationInfo>
         <entry>
            <key>bearerToken</key>
            <value>${token}</value>
         </entry>
      </authorizationInfo>
      <authorizationType>Bearer</authorizationType>
   </authorizationRequest>
   <autoUpdateContent>false</autoUpdateContent>
   <connectionTimeout>0</connectionTimeout>
   <followRedirects>true</followRedirects>
   <httpBody></httpBody>
   <httpBodyContent>{
  &quot;text&quot;: &quot;{ \n  \&quot;plate\&quot;: \&quot;${plate}\&quot;,\n  \&quot;vehicle_type\&quot;: \&quot;${vehicleType}\&quot;,\n  \&quot;card_code\&quot;: \&quot;${cardCode}\&quot;,\n   \&quot;image_url\&quot;: \&quot;${imageUrl}\&quot;\n}&quot;,
  &quot;contentType&quot;: &quot;application/json&quot;,
  &quot;charset&quot;: &quot;UTF-8&quot;
}</httpBodyContent>
   <httpBodyType>text</httpBodyType>
   <httpHeaderProperties>
      <isSelected>true</isSelected>
      <matchCondition>equals</matchCondition>
      <name>Content-Type</name>
      <type>Main</type>
      <value>application/json</value>
      <webElementGuid>d73b9c6a-68eb-4dce-af48-237e171a00ea</webElementGuid>
   </httpHeaderProperties>
   <httpHeaderProperties>
      <isSelected>true</isSelected>
      <matchCondition>equals</matchCondition>
      <name>Authorization</name>
      <type>Main</type>
      <value>Bearer ${token}</value>
      <webElementGuid>bb6ac6b0-9f2a-42e2-9734-7d877993658d</webElementGuid>
   </httpHeaderProperties>
   <katalonVersion>11.2.1</katalonVersion>
   <maxResponseSize>0</maxResponseSize>
   <migratedVersion>5.4.1</migratedVersion>
   <path></path>
   <restRequestMethod>POST</restRequestMethod>
   <restUrl>http://localhost:8080/api/v1/parking/check-in/visitor</restUrl>
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
      <id>1e02dc81-0d08-4ef8-b1df-ac3ef30df694</id>
      <masked>false</masked>
      <name>token</name>
   </variables>
   <variables>
      <defaultValue>'12A-40018'</defaultValue>
      <description></description>
      <id>1e02dc81-0d08-4ef8-b1df-ac3ef30df691</id>
      <masked>false</masked>
      <name>plate</name>
   </variables>
   <variables>
      <defaultValue>'LARGE_VAN_MINIBUS'</defaultValue>
      <description></description>
      <id>1e02dc81-0d08-4ef8-b1df-ac3ef30df692</id>
      <masked>false</masked>
      <name>vehicleType</name>
   </variables>
   <variables>
      <defaultValue>'000002'</defaultValue>
      <description></description>
      <id>1e02dc81-0d08-4ef8-b1df-ac3ef30df690</id>
      <masked>false</masked>
      <name>cardCode</name>
   </variables>
   <variables>
      <defaultValue>''</defaultValue>
      <description></description>
      <id>1e02dc81-0d08-4ef8-b1df-ac3ef30df693</id>
      <masked>false</masked>
      <name>imageUrl</name>
   </variables>
   <verificationScript>import com.kms.katalon.core.testobject.ResponseObject
import com.kms.katalon.core.webservice.keyword.WSBuiltInKeywords as WS
import groovy.json.JsonSlurper
import internal.GlobalVariable

// Lấy response của request hiện tại
ResponseObject response = WS.getResponse()
def jsonSlurper = new JsonSlurper()
def jsonResponse = jsonSlurper.parseText(response.getResponseText())

// Giả sử JSON trả về có trường &quot;cardId&quot; hoặc &quot;cardCode&quot;
// Ông thay &quot;cardId&quot; bằng tên trường tương ứng trong JSON của ông
GlobalVariable.currentIdentifier = jsonResponse.cardId.toString()</verificationScript>
   <wsdlAddress></wsdlAddress>
</WebServiceRequestEntity>
