<?xml version="1.0" encoding="UTF-8"?>
<WebServiceRequestEntity>
   <description></description>
   <name>Check-in AI</name>
   <tag></tag>
   <elementGuidId>fd8bdf3b-299f-4add-8945-d6c7cf94215e</elementGuidId>
   <selectorMethod>BASIC</selectorMethod>
   <smartLocatorEnabled>false</smartLocatorEnabled>
   <useRalativeImagePath>false</useRalativeImagePath>
   <autoUpdateContent>false</autoUpdateContent>
   <connectionTimeout>0</connectionTimeout>
   <followRedirects>true</followRedirects>
   <httpBody></httpBody>
   <httpBodyContent>{
  &quot;text&quot;: &quot;{\n  \&quot;plate\&quot;: \&quot;${plate}\&quot;,\n  \&quot;confidence_score\&quot;: ${confidence},\n  \&quot;vehicle_type\&quot;: \&quot;${vehicleType}\&quot;,\n  \&quot;image_url\&quot;: \&quot;${imageUrl}\&quot;\n}&quot;,
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
      <webElementGuid>b8bca380-ee69-4964-9882-7fde63294db4</webElementGuid>
   </httpHeaderProperties>
   <httpHeaderProperties>
      <isSelected>true</isSelected>
      <matchCondition>equals</matchCondition>
      <name>Authorization</name>
      <type>Main</type>
      <value>Bearer ${token}</value>
      <webElementGuid>b8bca380-ee69-4964-9882-7fde63294db5</webElementGuid>
   </httpHeaderProperties>
   <katalonVersion>11.2.1</katalonVersion>
   <maxResponseSize>0</maxResponseSize>
   <migratedVersion>5.4.1</migratedVersion>
   <path></path>
   <restRequestMethod>POST</restRequestMethod>
   <restUrl>http://localhost:8080/api/v1/parking/check-in/ai</restUrl>
   <serviceType>RESTful</serviceType>
   <soapBody></soapBody>
   <soapHeader></soapHeader>
   <soapRequestMethod></soapRequestMethod>
   <soapServiceEndpoint></soapServiceEndpoint>
   <soapServiceFunction></soapServiceFunction>
   <socketTimeout>0</socketTimeout>
   <useServiceInfoFromWsdl>true</useServiceInfoFromWsdl>
   <variables>
      <defaultValue>'30A-99999'</defaultValue>
      <description></description>
      <id>0d789ca5-d3df-4827-8bda-e239444384c2</id>
      <masked>false</masked>
      <name>plate</name>
   </variables>
   <variables>
      <defaultValue>'Double'</defaultValue>
      <description></description>
      <id>b6382888-8d57-4d2a-9ce5-ef9d63427583</id>
      <masked>false</masked>
      <name>confidence</name>
   </variables>
   <variables>
      <defaultValue>'FAMILY_CAR'</defaultValue>
      <description></description>
      <id>8e3fd28f-8aa3-4783-b5a3-af17ddf6caaf</id>
      <masked>false</masked>
      <name>vehicleType</name>
   </variables>
   <variables>
      <defaultValue>'http://mock-storage/test.jpg'</defaultValue>
      <description></description>
      <id>0ff7170c-8185-449a-802b-4f7343320617</id>
      <masked>false</masked>
      <name>imageUrl</name>
   </variables>
   <variables>
      <defaultValue>''</defaultValue>
      <description></description>
      <id>1ff7170c-8185-449a-802b-4f7343320618</id>
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
