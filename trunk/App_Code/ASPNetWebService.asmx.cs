using System;
using System.Collections.Generic;
using System.Web.Services;
using System.Web.Script.Services;
using System.Security.Principal;
using System.DirectoryServices;
using System.DirectoryServices.AccountManagement;
using System.Web.Mvc;
using System.Web.Script.Serialization;

namespace RequestDisplayNameGroupMembership
{
    /// <summary>
    /// Summary description for ASPNetWebService
    /// </summary>
    [WebService(Namespace = "http://mew.gov.kw/")]
    [WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
    //[System.ComponentModel.ToolboxItem(false)]
    // To allow this Web Service to be called from script, using ASP.NET AJAX, uncomment the following line. 
    [System.Web.Script.Services.ScriptService]
    public class ASPNetWebService : System.Web.Services.WebService
    {
		public class LoginName 
        {
            public string loginName { get; set; }
        }

        [WebMethod]
        [ScriptMethod(UseHttpGet = false, ResponseFormat = ResponseFormat.Json)]
        public JsonResult GetUserInfo(List<LoginName> loginNames)
        {
		
			//System.Threading.Thread.Sleep(2000);
			
			//throw new Exception();
			
			//IPrincipal p = this.User;
			//WindowsIdentity id = (WindowsIdentity)p.Identity;
				
			//WindowsIdentity windowsIdentity = System.Web.HttpContext.Current.Request.LogonUserIdentity;
            //windowsIdentity.Impersonate();
			//string userLoginName = WindowsIdentity.GetCurrent().Name;
			
            IList<Object> UserInfo = new List<Object>();
            //IList<Object> json = null;
            Object json = null;
/*
			UserPrincipal principal2 = null;
			if (loginNames[0].loginName.Length == 0) {
				principal2 = UserPrincipal.Current;

				json = new
						{
							LoginName = principal2.SamAccountName,
							DisplayName = principal2.DisplayName,
							UserPrincipalName = principal2.UserPrincipalName
							//Groups = groups
						};
				UserInfo.Add(json);
			}

			return new JsonResult { Data = UserInfo, JsonRequestBehavior = JsonRequestBehavior.AllowGet };
*/			
			
			using (System.Web.Hosting.HostingEnvironment.Impersonate())
			{
				using (PrincipalContext context = new PrincipalContext(ContextType.Domain))
				{
					//UserPrincipal principal;
					UserPrincipalEx principal;

					foreach (LoginName ln in loginNames)
					{
						if (ln.loginName.Length == 0)
							//principal = UserPrincipal.Current;
							//principal = UserPrincipal.FindByIdentity(context, userLoginName);
							principal = (UserPrincipalEx)UserPrincipal.FindByIdentity(context, Context.User.Identity.Name);
						else
							principal = (UserPrincipalEx)UserPrincipal.FindByIdentity(context, ln.loginName);

						//UserPrincipal principal = UserPrincipal.FindByIdentity(context, loginName);
						//PrincipalSearchResult<Principal> psr = principal.GetGroups();
						//IList<Object> groups = new List<Object>();
						//foreach (Principal pr in psr)
						//    groups.Add(pr.Name);

						if (principal == null)
						{
							json = new
							{
								LoginName = ln.loginName,
								DisplayName = ln.loginName,
								UserPrincipalName = ""
								//Groups = groups
							};

						}
						else
						{
							json = new
							{
								LoginName = principal.SamAccountName,
								//DisplayName = principal.ExtensionName,
								DisplayName = principal.DisplayName,
								UserPrincipalName = principal.UserPrincipalName
								//UserPrincipalName = Context.User.Identity.Name
								//UserPrincipalName = userLoginName
								//Groups = groups
							};
						}
						
						UserInfo.Add(json);
					}
				}
			}
            return new JsonResult { Data = UserInfo, JsonRequestBehavior = JsonRequestBehavior.AllowGet };
        }

        //public class MyUserPrincipal
        //{
        //    public string DisplayName;
        //    public string UserPrincipalName;
        //    public IList<Object> Groups;
        //}
    }
	
		//[DirectoryObjectClass("user")]
		//[DirectoryRdnPrefix("CN")]
		//[DirectoryServicesPermissionAttribute(SecurityAction.LinkDemand, Unrestricted = true)]
		//[DirectoryServicesPermissionAttribute(SecurityAction.InheritanceDemand, Unrestricted = true)]
		public class UserPrincipalEx : UserPrincipal
		{
			public UserPrincipalEx(PrincipalContext context) : base(context) { }

			public UserPrincipalEx(PrincipalContext context, string samAccountName, string password,  bool enabled ) : base(context, samAccountName, password, enabled)
			{
			}
/*
			[DirectoryProperty("ExtensionName")]
			public string ExtensionName
			{
				get
				{
					if (ExtensionGet("ExtensionName").Length != 1)
						return null;

					return (string)ExtensionGet("ExtensionName")[0];

				}
				//set { this.ExtensionSet("extensionName", value); }
			}
*/			
		}		
	
}
