# PRIMA

Repository for the module PRIMA (Prototyping interactive media-applications and games) at Furtwangen University

## Final Assignment: Rolands rasante Raserei

- Title: Rolands rasante Raserei
- Author: Roland Heer
- Year and season: SoSe 2022
- Curriculum and semester: MKB7
- Course this development was created in: PRIMA
- Docent: Prof. Dipl.-Ing. Jirka R. Dell'Oro-Friedl, HFU
- Click here for the [Game](https://rolandheer.github.io/Prima/Endabgabe/index.html)
- Click here for the [source Code](https://github.com/RolandHeer/Prima/tree/main/Endabgabe)
- Link to the [design document](https://github.com/RolandHeer/Prima/tree/main/Endabgabe/Documentation/designDocument.pdf): 

- Use WASD or the Arrowkeys to navigate the player car. Collect as many Coins as you can, use "M" to exit Pointerlock, use "J" to toggle between normal VUI and Fudge UserInterface


### Checklist

|  Nr | Criterion           | Explanation                                                                                                         |
| --: | ------------------- | ------------------------------------------------------------------------------------------------------------------- |
|   1 | Units and Positions | Die Null ist in der Weltmitte. eine Einheit entspricht einem Meter (der Citroen 2cv ist nicht unbedingt Maßstabsgetreu aber immerhin nah dran). Die Welt hat einen Durchmesser von 100 Metern somit ist der Abstand vom Auto zur Weltmitte immer 50m. Auch für die Verteilung der Münzen und sonstiger Objekte ist dies wichtig.                               |
|   2 | Hierarchy           | Es gibt 5 Hauptknotenpunkte, zum einen das Spielerauto, dann die Welt, der die einzelnen Weltelemente untergeordnet sind, spirch der Boden, Collectables, also Münzen und Kanister, aber auch Objekte mit denen interagiert werden kann, wie Reifenstapel. Im Sky Objekt ist zum einen die Skybox untergebracht, aber auch die Lichter die die Szene beleuchten. der NewCam Knoten ist für die Kamerasteuerung da. Diese ist vom Spielerauto losgelöst um einen leichten Delay in der Verfolgung des Autos und somit mehr Geschwindigkeit zu vermitteln. Und letztlich der PolizeiKnoten. in diesem werden die Polizeiautos gemanaged. diese wiederum sind dem Aufbau des Spielerautos sehr ähnlich.                                                |
|   3 | Editor              | Für den Aufbau der generellen Hirarchie war der Editor sehr hilfreich, da man durch die Anordnung der Knoten, mit deren ausklappbaren kind-knotenpunkten ein praktisches visuelles Feedback zur Hirarchie bekam. Auch zur Anordnung vereinzelter Objekte, wie dem Spielerauto und der Kameraeinstellung war der Editor sehr hilfreich. Für all die Collectables habe ich allerdings den Code genutzt, zum einen weil es viel zu Zeitaufwändig wäre so viele Münzen einzeln zu scattern, aber auch, weil diese ja zur Laufzeit neugeneriert werden müssen. why.                                    |
|   4 | Scriptcomponents    | Für repetetive Aufgaben wie das Drehen der Münzen und Kanister aber auch für die Gravitation, die ja immer zur Weltmitte wirkt (Reifenstapel), waren Skriptkomponenten sehr hilfreich, da ich diese Aufgaben dann nicht mehr im Hauptskript beachten musste.                         |
|   5 | Extend              | Das erstellen weiterer Klassen war super nützlich. Somit bleibt nicht nur der Code im Main noch einigermasen leßbar und strukturiert, aber auch das Coden der verschiedenen Fahrzeugtypen stellte sich somit als einfacher heraus, da ich Polizei und Player von der gleichen Klasse hab erben lassen können, was mir viel doppelten Code erspart hat.                 |
|   6 | Sound               | Geräusche haben wir nur die Motorensounds und die Polizeisirene. Letztere ist direkt an das Auto der Polizei geheftet und lässt sich somit orten. Der Audiolistener hängt direkt am Auto. Das Motorengeräusch des Spielerautos ist allerdings nicht über eine Soundcomponente eingebunden. Somit habe ich die Möglichkeit den Sound zur Laufzeit zu manipulieren und somit bei höherer Geschwindigkeit schneller und lauter werden zu lassen. Münzgeräusche beim aufsammeln selbiger und eine Hintergrundmusik waren geplant, ich bin nur leider nicht mehr dazu gekommen.perception.                     |
|   7 | VUI                 | Das Interface zeigt dem Spieler das nötigste. Die Anzahl der gesammelten Münzen, die Tankfülle und die Geschwindigkeit. Die Münzen als Counter, neben dem Münzicon, den Tank als Balken der schrumpft und die Geschwindigkeit als Tachonadel. Um der Anforderung gerecht zu werden, dass Mutables und das FudgeUserInterface genutzt wird, gibt es einen seperaten Modus bei dem vom hübschen Canvas Interface auf Html Elemente umgestiegen werden kann (dieses Feature wird jedoch nur vom Score unterstützt).          |
|   8 | Event-System        | Ich sende von der Polizei ausgehend eine Nachricht wenn sie den Spieler berührt hat. Diese Nachricht wird dann vom generellen Polizeiknotenpunkt aufgegriffen und ausgewertet. Im Prinzip könnten so die Polizeiautos miteinander kommunizieren Allerdings hab ich momentan nur das eine. In meinem Fall war dies nicht wirklich nützlich, da nicht das Berühren zählt sondern die Nähe über die Zeit um das Spieler Auto zu fangen. |
|   9 | External Data       | Im Konfigurationsfile habe ich die wichtigsten Daten gesammelt, mit denen das Spielverhalten leicht verändert werden kann. Hierzu gehören Parameter zur Bestimmung der Lenkitensität, der Kamera Delay, wie viele Münzen und Kanister auf der Welt verteilt werden, aber auch Dinge wie Parameter zur Skalierung der On-Screen Elemente. of parameters.   |
|   A | Light               | Wir haben ein Ambientlight, für die generelle Aufhellung der Szene, ein Direktionales kräftiges leicht warmes Sonnenlicht, und für die Schattenseite des Planeten ein ebenfalls direktionales, aber schwächeres blaues Mondlicht. Vielleicht gibt es auch Licht für das Warnlicht der Polizei (gibt es leider nicht weil ich nichtmal mehr das Warnlicht modelliert habe). (1Extrapunkt)                                                                   |
|   B | Physics             | Die Autos sind Dynamische Rigidbodys, die an einen Knotenpunkt in der Weltmitte gejoined sind (spherical Joint) Damit kann ich die Autos relativ in Ordnung auf der Kugel bewegen. Hierfür werden Kräfte verwendet, die immer relativ zum Lokalen Koordinatensystem des Autos berechnet werden. Die Autos können auf diese Art und Weise miteinender und mit anderen Rigidbodys (wie dem ominösen Reifenstapel) interagieren (3 Extrapunkte)             |
|   C | Net                 |  -                                                                      |
|   D | State Machines      |  -        |
|   E | Animation           | -                        |
