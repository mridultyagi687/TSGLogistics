<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=true; section>
    <#if section = "header">
        <div class="login-header">
            <div class="logo-container">
                <div class="logo-circle">T</div>
                <span class="logo-text">TSG Logistics</span>
            </div>
        </div>
    <#elseif section = "form">
        <div class="login-container">
            <div class="login-card">
                <h1 class="login-title">${msg("errorTitle")}</h1>
                <#if message?has_content>
                    <div class="alert alert-${message.type}">
                        <#if message.type = "error">
                            <ul>
                                <#list message.summary?split("<br>") as summary>
                                    <li>${kcSanitize(summary)?no_esc}</li>
                                </#list>
                            </ul>
                        <#else>
                            ${kcSanitize(message.summary)?no_esc}
                        </#if>
                    </div>
                </#if>
                <#if client?has_content>
                    <p><a href="${client.baseUrl}">${msg("backToApplication")}</a></p>
                </#if>
            </div>
        </div>
    </#if>
</@layout.registrationLayout>
