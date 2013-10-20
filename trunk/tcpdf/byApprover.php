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

$res = $r[0]["docs"];
//throw new Exception (print_r($res));
//throw new Exception ((string)!is_string($res[0]->docHistory[0]->docDate));

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
$pdf->setRTL(false);

// add a page
$pdf->AddPage();

// set text shadow effect
$pdf->setTextShadow(array('enabled'=>true, 'depth_w'=>0.2, 'depth_h'=>0.2, 'color'=>array(196,196,196), 'opacity'=>1, 'blend_mode'=>'Normal'));

//$text = "Filter: " . "Date From: " . $param[filter][dateFrom] . "; Date To: " . $param[filter][dateTo] . "; Approver: " . $param[filter][approver] .
//		"; Area: " . $param[filter][area] . "; Block: " . $param[filter][block] . "; Street: " . $param[filter][street] . "; PACI Number: " . $param[filter][paciNumber];

//$df = $param[filter][dateFrom];
$text = <<<EOD
Filter: <br/>
Date From: {$param[filter][dateFrom]}; Date To: {$param[filter][dateTo]} <br/>
Approver: {$param[filter][approver]} <br/>
Area: {$param[filter][area]}; Block: {$param[filter][block]}; Street: {$param[filter][street]}; PACI Number: {$param[filter][paciNumber]}
EOD;
		
// Print text using writeHTMLCell()
$pdf->writeHTMLCell($w=0, $h=0, $x='', $y='', $text, $border=0, $ln=1, $fill=0, $reseth=true, $align='', $autopadding=true);

$pdf->setRTL(true);

$header = array(array(14, 20, 12, 30, 15, 18, 18, 18, 18), array('رقم الملف', 'المنطقة', 'القطعة', 'رقم القسيمة حسب الوثيقة', 'المشرف الكهربائي', 'تاريخ استلام المعاملة', 'تاريخ تحويل المعاملة لقسم التكييف', 'الرقم الموحد للمبنى', 'اسم الموظف مدخل البيانات'));

foreach ($res as $r2) {
	$data[] = array($r2[doc]->docFileNumber, $r2[doc]->docArea, $r2[doc]->docBlock, $r2[doc]->docStreet, $r2[doc]->docBuilding, '',
						$r2[doc]->docHistory[0]->docDate, $r2[doc]->docPACINumber, $r2[doc]->docHistory[0]->docApprover);
}

//throw new Exception (print_r($data));

$pdf->PrintTable($header, $data);

// ---------------------------------------------------------

//Close and output PDF document
$file_name = "temp/" . uniqid() . ".pdf";
$pdf->Output($file_name, 'F');
