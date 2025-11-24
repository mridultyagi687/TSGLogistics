<!DOCTYPE html>
<html lang="<#if locale??>${locale.currentLanguageTag!}<#else>en</#if>" dir="<#if locale?? && locale.currentLanguageTag?contains('ar')>rtl<#else>ltr</#if>">
<head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
    <meta name="robots" content="noindex, nofollow">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title><#if realm?? && realm.displayName?has_content>${realm.displayName}<#else><#if msg??>${msg("loginTitle",(realm.displayName!''))}<#else>Sign in</#if></#if></title>
    <#if properties?? && properties.styles?has_content>
        <#list properties.styles?split(' ') as style>
            <link href="<#if url??>${url.resourcesPath!}<#else>/themes/tsg/login/resources</#if>/${style}" rel="stylesheet"/>
        </#list>
    </#if>
    <#if properties?? && properties.scripts?has_content>
        <#list properties.scripts?split(' ') as script>
            <script src="<#if url??>${url.resourcesPath!}<#else>/themes/tsg/login/resources</#if>/${script}" type="text/javascript"></script>
        </#list>
    </#if>
</head>
<body>
    <#macro registrationLayout displayMessage=false displayRequiredFields=false displayInfo=false displayWide=false showAnotherWayIfPresent=true>
        <#list ["header", "form"] as section>
            <#nested section>
        </#list>
        <#if displayInfo>
            <#nested "info">
        </#if>
    </#macro>
</body>
</html>
