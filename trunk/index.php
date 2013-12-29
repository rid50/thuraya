<?php
session_start();
require_once('c:/simplesaml/lib/_autoload.php');
//require_once('/var/www/html/simplesamlphp/lib/_autoload.php');
//require_once('/home/yarussor/public_html/simplesamlphp/lib/_autoload.php');

//$url = 'http://mewdesigncomps/index.html';

$ini = parse_ini_file("config.ini");
$idp = $ini["IdP"];
$idpSource = $ini["IdPSource"];

if ($idp == "SAML") {
	if ($idpSource == "DB")
		$as = new SimpleSAML_Auth_Simple('mewSQLAuth');
	else
		$as = new SimpleSAML_Auth_Simple('mewADAuth');
		
	$as->requireAuth();
	$attributes = $as->getAttributes();
	//$url = $url . '?loginName=' . $attributes["LoginName"];
	//$_SESSION['loginName'] = $attributes["LoginName"];
}

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<meta http-equiv="X-UA-Compatible" content="IE=9" />
	
    <title>Ministry of Electricity and Water</title>
    
	<link rel="shortcut icon" type="image/vnd.microsoft.icon" href="favicon.ico" />

	<!--link rel="stylesheet" media="all" href="themes/smoothness/jquery-ui-1.10.2.custom.min.css" /-->
	<link rel="stylesheet" media="all" href="themes/smoothness/jquery-ui-1.10.3.custom.min.css" />	
	<link rel="stylesheet" media="all" href="css/ui.jqgrid.css" />	
    <link rel="stylesheet" media="screen" type="text/css" href="css/style.css"/>
    <link rel="stylesheet" media="print" type="text/css" href="css/style.css"/>
    <!--script src="js/jquery-1.9.1.min.js" type="text/javascript"></script-->
    <script src="js/jquery-1.10.2.min.js" type="text/javascript"></script>
    
    <script src="js/jqGridJs/i18n/grid.locale-ar.js" type="text/javascript"></script>
    <script src="js/jqGridJs/i18n/grid.locale-en.js" type="text/javascript"></script>
	<script src="js/jqGridJs/jquery.jqGrid.min.js" type="text/javascript"></script>
    <script src="js/jqGridJs/grid.filtergrid.js" type="text/javascript"></script>
	
	<script src="js/jquery.blockUI.js" type="text/javascript"></script>
    <script src="js/jquery.hotkeys.js" type="text/javascript"></script>
	<!--script src="js/jstree.min.js" type="text/javascript"></script-->
	<script src="js/jquery.jstree.js" type="text/javascript"></script>
	<!--script src="js/jquery-ui-1.10.2.custom.min.js" type="text/javascript"></script-->
	<script src="js/jquery-ui-1.10.3.custom.min.js" type="text/javascript"></script>
	<script src="js/jquery.ui.datepicker-ar.js" type="text/javascript"></script>
	<script src="js/jquery.i18n.properties-min-1.0.9.js" type="text/javascript"></script>
	<script src="js/printThis.js" type="text/javascript"></script>
    <script src="js/script.js" type="text/javascript"></script>
    <script src="js/checkup_grid.js" type="text/javascript"></script>
	
	<style type="text/css">
		.accessRejected {
			background-image: url(images/rejected.png);
			background-position:0px 0px;
			background-repeat:repeat;
		}
	
		.ui-accordion .ui-accordion-content {
			padding: 1em 4px;
			overflow: hidden;
		}

	</style>

</head>

<body dir="ltr">
<form action="#">
<div class="customPageWidth">
	<div class="customHead customPagePadding">
		<?php /* <div><?=$_SESSION['loginName']?></div> */ ?>
		<div class="floatLeft">
			<a href="#" class="customLogo"><img src="images/logo.png" alt="Back to Home" title="Back to Home" /></a>
			<div class="customLogo2"></div>
		</div>
		
		<div class="floatRight">
			<!--div class="customPhone"></div-->
			<!--a href="#" id="LogIn" class="customLogin">User Login</a-->
			<a href="#" id="customFlagUK"><img src="images/FlagUK.png" alt="English" title="English" /></a>
			<a href="#" id="customFlagKuwait"><img src="images/FlagKuwait.png" alt="Arabic" title="Arabic" /></a>
			<div style="float:inherit; margin-top:6px"><span>User</span>:&nbsp;<select id="userLoginSelect" style="width:140px"></select></div>

			<div class="customClear"></div>
					
			<div class="customSearch floatLeft">
				<div class="customSearchBox"><input type="text" value="" size="15" /></div>
				<div class="customSearchGo" title="Go"></div>
			</div>
			<!--div class="customClear"></div-->	
		</div>
	</div>
<!--	
	<div class="customNav customPagePadding">
		<div class="customTopNavHolder">
			<div class="customTopNavItem"><a href="#">Frozen Waffles</a></div>
			<div class="customTopNavItem"><a href="#">Waffle of the Month</a></div>
			<div class="customTopNavItem"><a href="#">Fresh Maple Syrup</a></div>
			<div class="customTopNavItem"><a href="#">Creamery Butter</a></div>
			<div class="customTopNavItem"><a href="#">Specials</a></div>
			<div class="customTopNavItem"><a href="#">Waffle Blog</a></div>
		</div>	
	</div>
-->
	<div class="customBody">
	
		<!--div class="customClear"></div-->
		<div class="customMiddleSide floatLeft ui-corner-all">
			<div id="tabs" class="tabs-bottom">
				<ul>
					<li><a href="#tab-pending"></a></li>
					<li><a href="#tab-inprocess"></a></li>
					<li><a href="#tab-vault"></a></li>
					<li><a href="#tab-rejected"></a></li>
					<li><a href="#tab-edafat"></a></li>
					<li><a href="#tab-checkup-grid"></a></li>
					<li><a href="#tab-edit"><div id="newButtonTab"></div><span style="margin-left:20px"></span></a></li>
					<li><a href="#tab-users"></a></li>
				</ul>
				<div class="tabs-spacer"></div>
				<div id="tab-pending">
					<ul id="docs"></ul>
				</div>
				<div id="tab-inprocess">
					<ul id="inProcessDocs"></ul>
				</div>
				<div id="tab-vault">
					<ul id="vaultDocs"></ul>
				</div>
				<div id="tab-rejected">
					<ul id="rejectedDocs"></ul>
				</div>
				<div id="tab-edafat">
					<ul id="edafatDocs"></ul>
				</div>
				<div id="tab-checkup-grid">
				</div>
				<div id="tab-edit">
				</div>
				<div id="tab-users">
				</div>
			</div>
		</div>

		<div class="customRightSide floatRight ui-corner-all">
			<div id="accordion">
				<span>Search</span>
				<div>
					<div><span>File</span>#:&nbsp;<input type="text" id="file_number_search" size="17" class="text ui-widget-content ui-corner-all" /></div>
					<!--div><span>PACI</span>#:&nbsp;<input type="text" id="paci_number_search" maxlength="8" size="10" class="text ui-widget-content ui-corner-all" /></div-->
					<div><span>Approver</span>:&nbsp;<select id="approver_search" style="width:120px"  class="ui-widget-content ui-corner-all"></select></div>
					<!--div><span>From</span>:&nbsp;<div dir="ltr"><input type="text" id="datepicker" maxlength="10" size="10" class="text ui-widget-content ui-corner-all"/></div></div-->
					<div><span>From</span>:&nbsp;<input type="text" id="datepicker" maxlength="10" size="10" class="rid50-datepicker text ui-widget-content ui-corner-all"/></div>
					<div><span>To</span>:&nbsp;<input type="text" id="datepicker2" maxlength="10" size="10" class="rid50-datepicker text ui-widget-content ui-corner-all"/></div>
					<!--div><span>Area</span>:&nbsp;<select id="area_search" style="width:120px"  class="ui-widget-content ui-corner-all"></select></div-->
					<div><span>Area</span>:&nbsp;<input type="text" id="area_search" size="16" class="text ui-widget-content ui-corner-all"/></div>
					<div><span>Block</span>:&nbsp;<input type="text" id="block_search" size="16" class="text ui-widget-content ui-corner-all"/></div>
					<div><span>Plot</span>:&nbsp;<input type="text" id="plot_search" style="width:100px"  size="16" class="text ui-widget-content ui-corner-all"/></div>
					<button id="searchButton">Search</button>
					<button id="searchResetButton" title="Set fields empty">Reset</button>
					<div style="height:8px"></div>
				</div>
				<span>Report</span>
				<div style="text-align:center;">
					<div><select id="report_list" style="width:180px; margin-bottom:10px"  size="10" class="ui-widget-content ui-corner-all">Document list:
						<option value="byApprover">By approvers</option>
						<option value="byAddress">By address</option>
					</select></div>
					<div><button id="reportPrintButton">Print</button></div>
				</div>
			</div>

<!--		
			<div id="status" style="font-size:1.4em">Status</div>
			<ul id="ul-status">
				<li><a id="reject" href="" style="color:#f00">Rejected</a></li>
				<li><a id="approve" href="" style="color:#ff9900">In Progress</a></li>
				<li><a id="complete" href="" style="color:#0f0">Completed</a></li>
				<div id="userName"></div>
			</ul>
-->			
			<!--a href="#" id="newTaskItemButton" class="taskItemNewButton taskItemButtons floatRight" title="New"></a-->
		</div>
		
	
	
<!--	
		<div class="customBanner">
			<a href="#" class="customBannerText">Join Our Waffle of the Month Club</a>
			<a href="#" class="customBannerButton" title="Join Our Waffle of the Month Club"></a>
		</div>
		<div class="customClear"></div>
		
		<div class="customGapBeforePod"></div>
		<div class="customClear"></div>
		
		<div class="customPodHolder">
			<div class="customPod">
				<div class="customPodHeader">Fresh Maple Syrup</div>
				<p>Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Phasellus hendrerit. Pellentesque aliquet nibh nec urna. In nisi neque, aliquet vel, dapibus id, mattis vel, nisi. Sed pretium, ligula sollicitudin laoreet viverra, tortor libero sodales leo, eget blandit nunc tortor eu nibh. Nullam mollis. Ut justo. Suspendisse potenti.</p>
				<a href="#">More Info</a>
			</div>
			<div class="customPod">
				<div class="customPodHeader">Fresh Maple Syrup</div>
				<p>Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Phasellus hendrerit. Pellentesque aliquet nibh nec urna. In nisi neque, aliquet vel, dapibus id, mattis vel, nisi. Sed pretium, ligula sollicitudin laoreet viverra, tortor libero sodales leo, eget blandit nunc tortor eu nibh. Nullam mollis. Ut justo. Suspendisse potenti.</p>
				<a href="#">More Info</a>
			</div>
			<div class="customPod">
				<div class="customPodHeader">Fresh Maple Syrup</div>
				<a href="#">20 Frozen Waffles for $20.00</a>
				<p>Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Donec odio. Quisque volutpat mattis eros. </p>
				<br/>
				<a href="#">3000 Frozen Waffles for $60.00</a>
				<p>Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Donec odio. Quisque volutpat mattis eros. </p>
			</div>						
		</div>
		<div class="customClear"></div>
-->		
	</div>
	<div class="customFooter customPagePadding">
		<div id="Copyright" class="customFooterLeft floatLeft">
			&copy; Copyright 2013 Ministry of Electricity and Water &nbsp;|&nbsp; All Rights Reserved
		</div>
		<div class="customClear"></div>
		<div class="customFooterRight floatRight">
			<div class="customLinkGroup">
				<a id="TrainingProgram" href="#">Training Program</a><br/><br/>
				<a id="PrivacyPolicy" href="#">Privacy Policy</a>
			</div>
			<div class="customFooterDiv"></div>
			<div class="customLinkGroup">
				<a id="SiteMap" href="#">Site Map</a><br/><br/>
				<a id="MediaCenter" href="#">Media Center</a>
			</div>								
			<div class="customFooterDiv"></div>
			<div class="customLinkGroup">
				<a id="CustomerService" href="#">Customer Service</a><br/><br/>
				<a id="ContactUs" href="#">Contact Us</a>
			</div>
		</div>
	</div>
	<!--div class="customBottom"></div-->
</div>
</form>

<ul class='hiddenTemplate' style="display:none">
	<li id="TemplateListItems">
		<div class="docDetailDiv">
			<div class='docFileNumber floatLeft'>
				<div style="float:inherit;"><strong>File#:&nbsp;</strong></div>
				<span/>
			</div>

			<select class="floatLeft" style="width:250px"></select>

			<a href="#" class="docButtons floatRight"></a>
			<a href="#" class="docButtons floatRight"></a>
			<a href="#" class="docButtons floatRight"></a>
			<!--div class="floatRight" style="border: 1px solid red"><a href="#" class="tagButton"></a></div-->
			<a href="#" class="tagButton"></a>

			<div class="customClear"></div>
			<div class='docAddress floatLeft'>
				<div style="float:inherit;"><strong>Address:&nbsp;</strong></div>
				<span/>
			</div>

			<!--div class="customClear"></div>
			<div class='docPACINumber floatLeft'>
				<div style="float:inherit;"><strong>PACI#:&nbsp;</strong></div>
				<span/>
			</div-->

		</div>
	</li>
</ul>		

<div id="newForm" style="display:none">
	<p id="validateTips">Fields with the <strong>bold</strong> labels are required.</p>
	<form>
		<fieldset>
			<label for="file_number"><strong>File#</strong></label>
			<input type="text" name="file_number" id="file_number" autofocus maxlength="24" class="text ui-widget-content ui-corner-all" />

			<table>
				<tr>
					<td>
						<label for="area"><strong>Area</strong></label>
					</td>
					<td>
						<label for="block"><strong>Block</strong></label>
					</td>
					<td>
						<label for="plot"><strong>Plot</strong></label>
					</td>
				</tr>	
				<tr>
					<td>
						<input type="text" name="area" id="area" class="text ui-widget-content ui-corner-all" />
					</td>
					<td>
						<input type="text" name="block" id="block" maxlength="6" class="text ui-widget-content ui-corner-all" />
					</td>
					<td>
						<input type="text" name="plot" id="plot" class="text ui-widget-content ui-corner-all" />
					</td>
				</tr>	
			</table>
			<!--label for="paci_number">PACI#</label>
			<input type="text" name="paci_number" id="paci_number" maxlength="8" class="text ui-widget-content ui-corner-all" /-->
			<label id="labTitle" for="title"><strong>Title</strong></label>
			<textarea name="title" id="title" rows="3" class="text ui-widget-content ui-corner-all" ></textarea>
			<p><br/>
				<button id="saveButton" title="Insert new or update document">Save</button>
				<button id="resetButton" title="Set fields empty">Reset</button>
				<button id="cancelButton" style="display:none" title="Cancel">Cancel</button>
			</p>
		</fieldset>
	</form>
</div>

<div id="userAssignmentDiv" style="display:none">
	<div id="custom_jsTree" dir="ltr" style="background-color:transparent;">
		<ul/>
	</div>
	<!--div id="???" style="display:none; position:absolute; left:20px; bottom:40px"> F2 rename, DEL - delete </div-->
	<div id="userList" dir="ltr">
		<input style="margin: 3px 0 3px 13px;" type="text" value="" size="15" />
		<button id="addUserButton">Add User</button>
		<div class="customClear"></div>
		<ul></ul>
	</div>
</div>

<!--div id="dialog-form-comments"/-->

<div id="checkupForm" style="display:none">
	<form>
		<fieldset>
			<table>
				<tr>
					<td>
						<label for="checkup_number"><strong>Checkup#</strong></label>
					</td>
					<td>
						<label for="date_submission"><strong>Date of submittion</strong></label>
					</td>
				</tr>	
				<tr>
					<td>
						<input type="text" name="checkup_number" id="checkup_number" autofocus="autofocus" maxlength="24" class="text ui-widget-content ui-corner-all" />
					</td>
					<td>
						<input type="text" name="date_submission" id="date_submission" maxlength="10" size="10" class="rid50-datepicker text ui-widget-content ui-corner-all" />
					</td>
				</tr>	
				<tr>
					<td>
						<label for="file_number_checkup"><strong>File#</strong></label>
					</td>
					<td>
						<label for="date_checkup"><strong>Date of checkup</strong></label>
					</td>
					<td>
						<label for="address"><strong>Address</strong></label>
					</td>
				</tr>	
				<tr>
					<td>
						<input type="text" name="file_number_checkup" id="file_number_checkup" disabled="disabled" maxlength="24" class="text ui-widget-content ui-corner-all" />
					</td>
					<td>
						<input type="text" name="date_checkup" id="date_checkup" disabled="disabled" class="rid50-datepicker text ui-widget-content ui-corner-all" />
					</td>
					<td>
						<input type="text" name="address" id="address" disabled="disabled" class="text ui-widget-content ui-corner-all" />
					</td>
				</tr>
			</table>

			<table>
				<tr>
					<td>
						<label for="case"><strong>Case</strong></label>
					</td>
					<td>
						<label for="result"><strong>Result</strong></label>
					</td>
					<td>
						<label for="postponement"><strong>Postponement</strong></label>
					</td>
					<td>
						<label for="unsatisfactory_case"><strong>Case of unsatisfactory</strong></label>
					</td>
				</tr>
				
				<hr style="margin: 20px 0"/>
				
				<tr>
					<td>
						<select id="case" style="width:150px"  class="ui-widget-content ui-corner-all"></select>
					</td>
					<td>
						<select id="result" style="width:150px"  class="ui-widget-content ui-corner-all"></select>
					</td>
					<td>
						<select id="postponement" style="width:150px"  class="ui-widget-content ui-corner-all"></select>
					</td>
					<td>
						<select id="unsatisfactory_case" style="width:150px"  class="ui-widget-content ui-corner-all"></select>
					</td>
				</tr>
				
				
			</table>
<!--
			<hr style="margin: 20px 0"/>

			<p><br/>
				<button id="saveButton" title="Insert new or update document">Save</button>
				<button id="resetButton" title="Set fields empty">Reset</button>
				<button id="cancelButton" title="Cancel">Cancel</button>
			</p>		
-->			
		</fieldset>
	</form>
</div>

<div id="divGrid">
    <div style="padding-top: 10px; padding-left: 10px; height:24px;">
        Search:
        <input type="text" id="item" onkeydown="doSearch(arguments[0]||event)" style="float:none; padding: 0;" />
        <button onclick="gridReload()" id="submitButton">Search</button>
        <!--button onclick="f()" id="submitButton">Search</button-->
        <input type="checkbox" id="autosearch" onclick="enableAutosubmit(this.checked)" style="padding: 0; float:none; width:auto; border: 0" />
        Enable Autosearch
        <div id="search" style="visibility: hidden; width:10px; height: 10px"></div>
    </div>

    <div id="myjqGrid">
        <div>
			<table id="grid" ></table>
			<div id="pager"></div>
        </div>
        <!--div style="padding-top:10px;">
        <table id="grid_d"></table>
        <div id="pager_d"></div>
        </div-->
    </div>
</div>

</html>