# Linpack Parser
## Installation:
```bash
npm install -g linpackparser
```
Unter Releases sind auch kompilierte Binaries (nur für Linux getestet) zu finden, die Installation mit npm wird aber empfohlen. 
## Ausführen:
```bash
linpack-parser
```
Alternativ kann auch bereits in der Kommandozeile eine oder mehrere Dateien angegeben werdem:
```bash
linpack-parser /home/julian/logfile.o12345 /home/julian/logfile23.o12369
```
Nach der Ausührung des Befehls kann man eine Datei auswählen und welcher Wert in die erste Spalte soll, die zweite zeigt stets die GFlops. Anschließend erzeugt der parser eine csv Datei, in der die Daten tabellarisch aufgelistet sind.

## Update
### Version prüfen:
```bash
linpack-parser -v
```
### Updaten
```bash
npm update -g linpackparser
```
