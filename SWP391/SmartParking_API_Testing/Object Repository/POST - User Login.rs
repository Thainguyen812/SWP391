<?xml version="1.0" encoding="UTF-8"?>
<WebServiceRequestEntity>
   <description></description>
   <name>POST - User Login</name>
   <tag></tag>
   <elementGuidId>7be2b6c8-8ab8-405b-beef-c70137b3390b</elementGuidId>
   <selectorMethod>BASIC</selectorMethod>
   <smartLocatorEnabled>false</smartLocatorEnabled>
   <useRalativeImagePath>false</useRalativeImagePath>
   <autoUpdateContent>false</autoUpdateContent>
   <connectionTimeout>0</connectionTimeout>
   <followRedirects>true</followRedirects>
   <httpBody></httpBody>
   <httpBodyContent>{
  &quot;text&quot;: &quot;{\n  \&quot;plate\&quot;: \&quot;30A-99999\&quot;,\n  \&quot;confidence_score\&quot;: 95.0,\n  \&quot;vehicle_type\&quot;: \&quot;FAMILY_CAR\&quot;,\n  \&quot;image_url\&quot;: \&quot;http://mock-storage/30A-99999_in.jpg\&quot;\n}&quot;,
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
      <webElementGuid>aac6003d-f6c9-453a-a5e2-8b07df1ef68b</webElementGuid>
   </httpHeaderProperties>
   <httpHeaderProperties>
      <isSelected>true</isSelected>
      <matchCondition>equals</matchCondition>
      <name>Authorization</name>
      <type>Main</type>
      <value>Bearer ${token}</value>
      <webElementGuid>ac1af442-6ed6-4bbb-92b4-7a639add7246</webElementGuid>
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
      <id>5c353a95-c27b-4ec7-9014-c624c7931c37</id>
      <masked>false</masked>
      <name>plate</name>
   </variables>
   <variables>
      <defaultValue>'95.0'</defaultValue>
      <description></description>
      <id>314d0417-b56e-4e36-80e6-a19d3116eb63</id>
      <masked>false</masked>
      <name>confidence</name>
   </variables>
   <variables>
      <defaultValue>'FAMILY_CAR'</defaultValue>
      <description></description>
      <id>28926206-ec2f-4b98-be85-200b3ff3b551</id>
      <masked>false</masked>
      <name>vehicleType</name>
   </variables>
   <variables>
      <defaultValue>'http://mock-storage/30A-99999_in.jpg'</defaultValue>
      <description></description>
      <id>1d8b4f87-9321-4768-910c-bccbffde6da8</id>
      <masked>false</masked>
      <name>imageUrl</name>
   </variables>
   <variables>
      <defaultValue>''</defaultValue>
      <description></description>
      <id>8bfd18c5-43ef-486e-bbe2-f0f3784009d9</id>
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
