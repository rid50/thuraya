<?php
require_once('config/lang/eng.php');
require_once('tcpdf.php');

// extend TCPF with custom functions
class MYPDF extends TCPDF {
	public function PrintTable($header,$data) {
		$this->SetFillColor(224, 235, 255);
		$this->SetTextColor(0);

		// Header
		$w = $header[0];
		$num_headers = count($header[0]);
		for($i = 0; $i < $num_headers; ++$i) {
			$this->MultiCell($w[$i], 14, $header[1][$i], 1, 'C', 1, 0);
		}
		$this->Ln();

		$this->SetFontSize(8);
		// Data
		$fill = 0;
		foreach($data as $row) {
			for($i = 0; $i < $num_headers; ++$i) {
				//$this->Cell($w[$i], 6, $row[$i], 'LR', 0, 'R', $fill);
				$this->MultiCell($w[$i], 10, $row[$i], 'LR', 'R', $fill, 0);
			}
			$this->Ln();
			$fill=!$fill;
		}
		$this->Cell(array_sum($w), 0, '', 'T');
	}
}

//throw new Exception (print_r($res));

// create new PDF document
$pdf = new MYPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);

// set header and footer fonts
$pdf->setHeaderFont(Array(PDF_FONT_NAME_MAIN, '', PDF_FONT_SIZE_MAIN));
$pdf->setFooterFont(Array(PDF_FONT_NAME_DATA, '', PDF_FONT_SIZE_DATA));

// set default monospaced font
$pdf->SetDefaultMonospacedFont(PDF_FONT_MONOSPACED);

//set margins
$pdf->SetMargins(PDF_MARGIN_LEFT, PDF_MARGIN_TOP, PDF_MARGIN_RIGHT);
$pdf->SetHeaderMargin(PDF_MARGIN_HEADER);
$pdf->SetFooterMargin(PDF_MARGIN_FOOTER);

//set auto page breaks
$pdf->SetAutoPageBreak(TRUE, PDF_MARGIN_BOTTOM);

//set image scale factor
$pdf->setImageScale(PDF_IMAGE_SCALE_RATIO);

//set some language-dependent strings
$pdf->setLanguageArray($l);

// ---------------------------------------------------------

$pdf->setFontSubsetting(true);

$pdf->SetFont('arial', '', 10, '', true);
$pdf->setRTL(true);

// add a page
$pdf->AddPage();

// set text shadow effect
$pdf->setTextShadow(array('enabled'=>true, 'depth_w'=>0.2, 'depth_h'=>0.2, 'color'=>array(196,196,196), 'opacity'=>1, 'blend_mode'=>'Normal'));

$text = <<<EOD
تم الاجتماع مع السيدة الفاضلة ممثلة  إدارة محطات التمديدات الكهربائية وتضمن الاجتماع مناقشة النقاط التالية:
EOD;

//$html = include 'doc_text_01.txt';
//$text = file_get_contents("doc_text_02.txt");
//$text = mb_convert_encoding($text, "UTF-8");

// Print text using writeHTMLCell()
$pdf->writeHTMLCell($w=0, $h=0, $x='', $y='', $text, $border=0, $ln=1, $fill=0, $reseth=true, $align='', $autopadding=true);

$dt = array(); $ap = array();
if (is_string($res[0]->docHistory[0]->docDate)) {
	$dt[0] = $res[0]->docHistory[0]->docDate;
	$dt[1] = $res[0]->docHistory[1]->docDate;
	$dt[2] = $res[0]->docHistory[2]->docDate;
	$ap[0] = $res[0]->docHistory[0]->docApprover;
	$ap[1] = $res[0]->docHistory[1]->docApprover;
	$ap[2] = $res[0]->docHistory[2]->docApprover;
} else {
	$dt[0] = $res[0]->docHistory->docDate[0];
	$dt[1] = $res[0]->docHistory->docDate[1];
	$dt[2] = $res[0]->docHistory->docDate[2];
	$ap[0] = $res[0]->docHistory->docApprover[0];
	$ap[1] = $res[0]->docHistory->docApprover[1];
	$ap[2] = $res[0]->docHistory->docApprover[2];
}

$header = array(array(14, 20, 12, 30, 15, 18, 18, 18, 18), array('رقم الملف', 'المنطقة', 'القطعة', 'رقم القسيمة حسب الوثيقة', 'المشرف الكهربائي', 'تاريخ استلام المعاملة', 'تاريخ تحويل المعاملة لقسم التكييف', 'الرقم الموحد للمبنى', 'اسم الموظف مدخل البيانات'));
$data = array(array($res[0]->docFileNumber, $res[0]->docArea, $res[0]->docBlock, $res[0]->docStreet, $res[0]->docBuilding, '',
					$dt[0], $res[0]->docPACINumber, $ap[0]));
//$data = array(array('a', 'b', 'c', 'd'), array('a2', 'b2', 'c2', 'd2'));

$pdf->PrintTable($header, $data);
$pdf->Ln();

$text = <<<EOD
بعد تحويل المعاملة إلى قسم التكييف، يراد أن يضاف للجدول السابق البيانات التالية بحيث يقوم بإدخالها الموظف المسئول من قسم التكيف:
EOD;

$pdf->writeHTMLCell($w=0, $h=0, $x='', $y='', $text, $border=0, $ln=1, $fill=0, $reseth=true, $align='', $autopadding=true);

$header = array(array(18, 18, 18, 18), array('اسم المهندس', 'تاريخ التحويل', 'تاريخ الاعتماد', 'تاريخ الملاحظات'));
$data = array(array($ap[1], $dt[1], '', ''));
$pdf->PrintTable($header, $data);
$pdf->Ln();

$text = <<<EOD
تحول المعاملة إلى قسم الكهرباء ويضاف لملف المعاملة الالكتروني نفس البنود الواردة بالجدول السابق ليقوم بتعبئتها <br/>
موظفو قسم الكهرباء ثم يتم تحويل المعاملة إلى المدير. يقوم الموظف المختص من مكتب المدير بتسجيل تاريخ اعتماد  <br/>
المدير. <br/>
يراد ربط النظام الجديد مع النظام المستخدم في قسم الفحص بحيث يقوم النظام الجديد بإرسال البيانات التالية للنظام القديم :
EOD;

$pdf->writeHTMLCell($w=0, $h=0, $x='', $y='', $text, $border=0, $ln=1, $fill=0, $reseth=true, $align='', $autopadding=true);

$header = array(array(18, 18), array('اسم المشرف', 'موعد الفحص'));
$data = array(array($ap[2], $dt[2]));
$pdf->PrintTable($header, $data);
$pdf->Ln();

// ---------------------------------------------------------

//Close and output PDF document
$file_name = "temp/" . uniqid() . ".pdf";
$pdf->Output($file_name, 'F');
