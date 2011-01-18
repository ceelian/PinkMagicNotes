<?php
//http://www.pmnserver.org/restwrapper.php?url=/notes/123?var1=hallo&var2=bla

$wrapper_str= explode('?',$_SERVER['QUERY_STRING'],2);
$_SERVER['REDIRECT_URL']=substr($wrapper_str[0],4);
$_SERVER['REDIRECT_QUERY_STRING']=$wrapper_str[1];
$_SERVER['QUERY_STRING']=$wrapper_str[1];


$raw_req_uri=explode('?',$_SERVER['REQUEST_URI'],2);
$_SERVER['REQUEST_URI']= substr($raw_req_uri[1],4);

//print_r($_SERVER);
?>
