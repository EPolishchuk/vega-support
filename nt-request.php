<?php

$file = 'nt.log';
$ipg = $_SERVER["REMOTE_ADDR"];

$commandArray = array(
    "ping",
    "traceroute",
    "nslookup",
    "whois",
    "dig",
    "host",
    "nmap"
);

$hostFlag = false;

if (isset($_GET['h']) && ($_GET['h'] != null)) {
    $host = $_GET['h'];
} else {
    echo "ОШИБКА: Не получен IP или домен";
    $current = file_get_contents($file);
    $date = date('Y-m-d H:i:s');
    $current = $date . " Не получен IP или домен\n" . $current;
    file_put_contents($file, $current);
};

if (isset($_GET['c'])) {
    $command = $commandArray[intval($_GET['c'])];
    if ($command == 'host' || $command == 'nslookup') {
        $hostFlag = true;
    }
} else {
    echo "Не получена команда";
    $current = file_get_contents($file);
    $date = date('Y-m-d H:i:s');
    $current = $date . " Не получена команда\n" . $current;
    file_put_contents($file, $current);
};

if (isset($_GET['a']) && $_GET['a'] != '') {
    $add = $_GET['a'];
} elseif ($command != 'whois' && $command != 'nslookup') {
    echo "Не получены вторичные параметры";
    $current = file_get_contents($file);
    $date = date('Y-m-d H:i:s');
    $current = $date . " Не получены вторичные параметры\n" . $current;
    file_put_contents($file, $current);
} else {
	$add = '';
};

$check = isset($host) && isset($command) && isset($add);

if ($check) {
    echo "<br>[root@phpnettools]# ";
    if ($hostFlag || $add == '-x' ) {
        $txt = $command . " " . $add . " " . $host . " ";
    } else {
        $txt = $command . " " . $host . " " . $add . " ";
    }
    
    $consol = "<table>";
    echo $txt;
    echo "<br><br>";
    exec(escapeshellcmd($txt), $output, $status);
    $current = file_get_contents($file);
    $date = date('Y-m-d H:i:s');
    $current = $ipg . " " . $date . " " . $txt . " \n"  . $current;
    file_put_contents($file, $current);
    for ($i = 0; $i < count($output); $i++) {
        echo $output[$i] . '<br>';
        $consol .= "<tr><td>" . $output[$i] . '</td></tr><br>';
    }
    $consol .= "</table>";
}

?>