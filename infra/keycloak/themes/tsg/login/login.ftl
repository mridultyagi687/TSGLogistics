<#import "template.ftl" as layout>
<#if messagesPerField?? && messagesPerField.existsError('username','password')>
    <#assign displayMessageValue = false>
<#else>
    <#assign displayMessageValue = true>
</#if>
<@layout.registrationLayout displayMessage=displayMessageValue displayRequiredFields=false; section>
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
                <h1 id="kc-page-title" class="login-title">
                    <#if realm.displayName?has_content>
                        ${realm.displayName}
                    <#else>
                        ${msg("loginTitle",(realm.displayName!''))}
                    </#if>
                </h1>
                
                <#if realm.internationalizationEnabled>
                    <div id="kc-locale">
                        <div id="kc-locale-wrapper" class="${properties.kcLocaleWrapperClass!}">
                            <div class="kc-dropdown" id="kc-locale-dropdown">
                                <a href="#" id="kc-current-locale-link">${locale.current}</a>
                                <ul>
                                    <#list locale.supported as l>
                                        <li class="kc-dropdown-item"><a href="${l.url}">${l.label}</a></li>
                                    </#list>
                                </ul>
                            </div>
                        </div>
                    </div>
                </#if>

                <div id="kc-content">
                    <div id="kc-content-wrapper">
                        <#if displayMessage?? && displayMessage && message?? && message?has_content && (message.type != 'warning' || !isAppInitiatedAction??)>
                            <div class="alert alert-${message.type}">
                                <ul>
                                    <#list message.summary?split("<br>") as summary>
                                        <li>${kcSanitize(summary)?no_esc}</li>
                                    </#list>
                                </ul>
                            </div>
                        </#if>

                        <div id="kc-form">
                            <div id="kc-form-wrapper">
                                <form id="kc-form-login" onsubmit="login.disabled = true; return true;" action="${url.loginAction}" method="post">
                                    <div class="form-group">
                                        <#if usernameHidden??>
                                            <input tabindex="1" id="username" name="username" value="${(login.username!'')}" type="hidden"/>
                                        <#else>
                                            <label for="username" class="form-label">
                                                <#if !realm.loginWithEmailAllowed>
                                                    ${msg("username")}
                                                <#elseif !realm.registrationEmailAsUsername>
                                                    ${msg("usernameOrEmail")}
                                                <#else>
                                                    ${msg("email")}
                                                </#if>
                                            </label>
                                            <input tabindex="1" id="username" class="form-input <#if messagesPerField??>${messagesPerField.printIfExists('username','error')}</#if>" name="username" value="${(login.username!'')}" type="text" autofocus autocomplete="off" aria-invalid="<#if messagesPerField?? && messagesPerField.existsError('username','password')>true</#if>"/>
                                            <#if messagesPerField?? && messagesPerField.existsError('username','password')>
                                                <span id="input-error" class="input-error" aria-live="polite">
                                                    <#if messagesPerField??>${kcSanitize(messagesPerField.getFirstError('username','password'))?no_esc}</#if>
                                                </span>
                                            </#if>
                                        </#if>
                                    </div>

                                    <div class="form-group">
                                        <div class="password-label-container">
                                            <label for="password" class="form-label">${msg("password")}</label>
                                            <#if realm.resetPasswordAllowed>
                                                <span><a tabindex="5" href="${url.loginResetCredentialsUrl}" class="forgot-password-link">${msg("doForgotPassword")}</a></span>
                                            </#if>
                                        </div>
                                        <input tabindex="2" id="password" class="form-input <#if messagesPerField??>${messagesPerField.printIfExists('password','error')}</#if>" name="password" type="password" autocomplete="off" aria-invalid="<#if messagesPerField?? && messagesPerField.existsError('username','password')>true</#if>"/>
                                        <#if messagesPerField?? && messagesPerField.existsError('password')>
                                            <span id="input-error-password" class="input-error" aria-live="polite">
                                                <#if messagesPerField??>${kcSanitize(messagesPerField.getFirstError('password'))?no_esc}</#if>
                                            </span>
                                        </#if>
                                    </div>

                                    <div class="form-options">
                                        <#if realm.rememberMe && !usernameHidden??>
                                            <div class="checkbox">
                                                <label>
                                                    <#if login.rememberMe??>
                                                        <input tabindex="3" id="rememberMe" name="rememberMe" type="checkbox" checked> ${msg("rememberMe")}
                                                    <#else>
                                                        <input tabindex="3" id="rememberMe" name="rememberMe" type="checkbox"> ${msg("rememberMe")}
                                                    </#if>
                                                </label>
                                            </div>
                                        </#if>
                                    </div>

                                    <div id="kc-form-buttons" class="form-actions">
                                        <input type="hidden" id="id-hidden-input" name="credentialId" <#if auth.selectedCredential?has_content>value="${auth.selectedCredential}"</#if>/>
                                        <input tabindex="4" class="submit-button" name="login" id="kc-login" type="submit" value="${msg("doLogIn")}"/>
                                    </div>
                                </form>
                            </div>
                        </div>

                        <#if realm.password && realm.registrationAllowed && !registrationDisabled??>
                            <div id="kc-registration-container">
                                <div id="kc-registration">
                                    <span>${msg("noAccount")} <a tabindex="6" href="${url.registrationUrl}">${msg("doRegister")}</a></span>
                                </div>
                            </div>
                        </#if>
                    </div>
                </div>
            </div>

            <#if realm.password && social.providers??>
                <div id="kc-social-providers" class="social-providers">
                    <hr/>
                    <h4>${msg("identity-provider-login-label")}</h4>
                    <ul class="social-providers-list">
                        <#list social.providers as p>
                            <li><a id="social-${p.alias}" class="social-provider-button" type="button" href="${p.loginUrl}">
                                <#if p.iconClasses?has_content>
                                    <i class="${properties.kcCommonLogoIdP!} ${p.iconClasses!}" aria-hidden="true"></i>
                                    <span class="${properties.kcFormSocialAccountNameClass!} kc-social-icon-text">${p.displayName!}</span>
                                <#else>
                                    <span class="${properties.kcFormSocialAccountNameClass!}">${p.displayName!}</span>
                                </#if>
                            </a></li>
                        </#list>
                    </ul>
                </div>
            </#if>
        </div>
    </#if>
</@layout.registrationLayout>
