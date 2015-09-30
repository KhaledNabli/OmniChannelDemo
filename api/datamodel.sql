-- phpMyAdmin SQL Dump
-- version 4.2.7.1
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Erstellungszeit: 30. Sep 2015 um 16:02
-- Server Version: 5.6.20-log
-- PHP-Version: 5.5.15

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Datenbank: `omnichanneldemo`
--

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `contact_response_history`
--

CREATE TABLE IF NOT EXISTS `contact_response_history` (
  `token` varchar(64) NOT NULL,
  `customer` varchar(64) NOT NULL,
  `offer` varchar(64) NOT NULL,
  `channel` varchar(64) NOT NULL,
  `entrytype` varchar(64) NOT NULL,
  `responsetype` varchar(64) NOT NULL,
  `responsedetails` varchar(512) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `customer_offers`
--

CREATE TABLE IF NOT EXISTS `customer_offers` (
  `token` varchar(64) NOT NULL,
  `customer` varchar(64) NOT NULL,
  `offer` varchar(64) NOT NULL,
  `score` int(11) NOT NULL,
  `display_limit` int(11) NOT NULL,
  `responded` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `demo_config`
--

CREATE TABLE IF NOT EXISTS `demo_config` (
`id` int(11) NOT NULL,
  `token` varchar(64) NOT NULL,
  `config_json` text NOT NULL,
  `create_dttm` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modify_dttm` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `modify_by` varchar(64) NOT NULL,
  `email_to` varchar(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `demo_config`
--
ALTER TABLE `demo_config`
 ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `token` (`token`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `demo_config`
--
ALTER TABLE `demo_config`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
