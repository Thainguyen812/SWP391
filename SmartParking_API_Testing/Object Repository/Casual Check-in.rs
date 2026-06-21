<?xml version="1.0" encoding="UTF-8"?>
<WebServiceRequestEntity>
   <description></description>
   <name>Casual Check-in</name>
   <tag></tag>
   <elementGuidId>cf1ec021-5e0c-4153-a62c-044ead65c4e3</elementGuidId>
   <selectorMethod>BASIC</selectorMethod>
   <smartLocatorEnabled>false</smartLocatorEnabled>
   <useRalativeImagePath>false</useRalativeImagePath>
   <autoUpdateContent>false</autoUpdateContent>
   <connectionTimeout>-1</connectionTimeout>
   <followRedirects>true</followRedirects>
   <httpBody></httpBody>
   <httpBodyContent>{
  &quot;text&quot;: &quot;{\n  \&quot;card_code\&quot;: \&quot;${cardCode}\&quot;,\n  \&quot;image_url\&quot;: \&quot;${imageUrl}\&quot;,\n  \&quot;vehicle_type\&quot;: \&quot;${vehicleType}\&quot;,\n  \&quot;plate\&quot;: \&quot;${plate}\&quot;\n}&quot;,
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
      <webElementGuid>d73b9c6a-68eb-4dce-af48-237e171a00eb</webElementGuid>
   </httpHeaderProperties>
   <katalonVersion>11.2.1</katalonVersion>
   <maxResponseSize>-1</maxResponseSize>
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
   <socketTimeout>-1</socketTimeout>
   <useServiceInfoFromWsdl>true</useServiceInfoFromWsdl>
   <variables>
      <defaultValue>''</defaultValue>
      <description></description>
      <id>1e02dc81-0d08-4ef8-b1df-ac3ef30df690</id>
      <masked>false</masked>
      <name>cardCode</name>
   </variables>
   <variables>
      <defaultValue>''</defaultValue>
      <description></description>
      <id>1e02dc81-0d08-4ef8-b1df-ac3ef30df691</id>
      <masked>false</masked>
      <name>plate</name>
   </variables>
   <variables>
      <defaultValue>'FAMILY_CAR'</defaultValue>
      <description></description>
      <id>1e02dc81-0d08-4ef8-b1df-ac3ef30df692</id>
      <masked>false</masked>
      <name>vehicleType</name>
   </variables>
   <variables>
      <defaultValue>'http://mock-storage/casual_in.jpg'</defaultValue>
      <description></description>
      <id>1e02dc81-0d08-4ef8-b1df-ac3ef30df693</id>
      <masked>false</masked>
      <name>imageUrl</name>
   </variables>
   <variables>
      <defaultValue>''</defaultValue>
      <description></description>
      <id>1e02dc81-0d08-4ef8-b1df-ac3ef30df694</id>
      <masked>false</masked>
      <name>token</name>
   </variables>
   <verificationScript>import static org.assertj.core.api.Assertions.*

import com.kms.katalon.core.testobject.RequestObject
import com.kms.katalon.core.testobject.ResponseObject
import com.kms.katalon.core.webservice.keyword.WSBuiltInKeywords as WS
import com.kms.katalon.core.webservice.verification.WSResponseManager

import groovy.json.JsonSlurper
import internal.GlobalVariable as GlobalVariable

RequestObject request = WSResponseManager.getInstance().getCurrentRequest()

ResponseObject response = WSResponseManager.getInstance().getCurrentResponse()</verificationScript>
   <wsdlAddress></wsdlAddress>
</WebServiceRequestEntity>
