<?xml version="1.0" encoding="UTF-8"?>
<WebServiceRequestEntity>
   <description></description>
   <name>update</name>
   <tag></tag>
   <elementGuidId>b1e1c6cf-6fde-4ef7-ab3d-a1fe1a361f14</elementGuidId>
   <selectorMethod>BASIC</selectorMethod>
   <smartLocatorEnabled>false</smartLocatorEnabled>
   <useRalativeImagePath>false</useRalativeImagePath>
   <autoUpdateContent>true</autoUpdateContent>
   <connectionTimeout>-1</connectionTimeout>
   <followRedirects>true</followRedirects>
   <httpBody></httpBody>
   <httpBodyContent>{
  &quot;text&quot;: &quot;{\n  \&quot;registrationPhotoUrl\&quot;: \&quot;string\&quot;,\n  \&quot;color\&quot;: \&quot;string\&quot;,\n  \&quot;active\&quot;: true,\n  \&quot;ownerId\&quot;: \&quot;string\&quot;,\n  \&quot;colorRgb\&quot;: \&quot;string\&quot;,\n  \&quot;createdAt\&quot;: \&quot;2025-01-01T00:00:00Z\&quot;,\n  \&quot;licensePlate\&quot;: \&quot;string\&quot;,\n  \&quot;violationCount\&quot;: 0,\n  \&quot;vehicleSize\&quot;: \&quot;string\&quot;,\n  \&quot;registrationDocUrl\&quot;: \&quot;string\&quot;,\n  \&quot;id\&quot;: \&quot;string\&quot;,\n  \&quot;brand\&quot;: \&quot;string\&quot;,\n  \&quot;bodyShape\&quot;: \&quot;string\&quot;,\n  \&quot;updatedAt\&quot;: \&quot;2025-01-01T00:00:00Z\&quot;\n}&quot;,
  &quot;contentType&quot;: &quot;application/json&quot;,
  &quot;charset&quot;: &quot;UTF-8&quot;
}</httpBodyContent>
   <httpBodyType>text</httpBodyType>
   <katalonVersion>11.2.1</katalonVersion>
   <maxResponseSize>-1</maxResponseSize>
   <migratedVersion>5.4.1</migratedVersion>
   <path>/api/vehicles/{id}</path>
   <restRequestMethod>PUT</restRequestMethod>
   <restUrl>http://localhost:8080/api/vehicles/${id}</restUrl>
   <serviceType>RESTful</serviceType>
   <soapBody></soapBody>
   <soapHeader></soapHeader>
   <soapRequestMethod></soapRequestMethod>
   <soapServiceEndpoint></soapServiceEndpoint>
   <soapServiceFunction></soapServiceFunction>
   <socketTimeout>-1</socketTimeout>
   <useServiceInfoFromWsdl>true</useServiceInfoFromWsdl>
   <variables>
      <defaultValue>null</defaultValue>
      <description>&lt;string> {Required} null</description>
      <id>86f0e00e-c65a-40d8-895a-bc75e7fe8b23</id>
      <masked>false</masked>
      <name>id</name>
   </variables>
   <wsdlAddress></wsdlAddress>
</WebServiceRequestEntity>
