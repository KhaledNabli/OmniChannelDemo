
--
-- Tabellenstruktur für Tabelle `demo_config`
--
DROP TABLE IF EXISTS `demo_config`;
CREATE TABLE IF NOT EXISTS `demo_config` (
`id` int(11) NOT NULL,
  `token` varchar(64) NOT NULL,
  `config_name` varchar(64) NOT NULL,
  `config_desc` varchar(128) NOT NULL,
  `read_only` int(11) DEFAULT NULL,
  `config_json` text NOT NULL,
  `create_dttm` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modify_dttm` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `modify_by` varchar(64) NOT NULL,
  `email_to` varchar(64) NOT NULL
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

ALTER TABLE `demo_config`
 ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `token` (`token`);

ALTER TABLE `demo_config`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=1;


--
-- Tabellenstruktur für Tabelle `demo_website`
--
DROP TABLE IF EXISTS `demo_website`;
CREATE TABLE IF NOT EXISTS `demo_website` (
  `token` varchar(32) NOT NULL,
  `site` varchar(32) NOT NULL,
  `content` mediumtext CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `create_dttm` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modify_dttm` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `modify_by` varchar(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

ALTER TABLE `demo_website`
 ADD PRIMARY KEY (`token`,`site`);

 