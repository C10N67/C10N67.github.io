<a href="https://c10n67.github.io">
  <img src="assets/banner.png" alt="Daniel Carballo Reyes · Ingeniero de Telecomunicación · 5G · Kubernetes · Cloud Native" width="100%">
</a>

<p align="center">
  <a href="https://c10n67.github.io"><img src="https://img.shields.io/badge/Portfolio-c10n67.github.io-22d3ee?style=flat-square&logo=githubpages&logoColor=white" alt="Portfolio"></a>
  <a href="https://www.linkedin.com/in/danielcarballoreyes/"><img src="https://img.shields.io/badge/LinkedIn-danielcarballoreyes-0A66C2?style=flat-square&logo=linkedin&logoColor=white" alt="LinkedIn"></a>
  <a href="mailto:dani.carballoreyes@gmail.com"><img src="https://img.shields.io/badge/Email-dani.carballoreyes-EA4335?style=flat-square&logo=gmail&logoColor=white" alt="Email"></a>
  <a href="https://c10n67.github.io/files/CV_Daniel_Carballo.pdf"><img src="https://img.shields.io/badge/CV-PDF-a78bfa?style=flat-square&logo=readdotcv&logoColor=white" alt="CV"></a>
</p>

```console
~/daniel $ whoami
Daniel Carballo Reyes · Ingeniero en Tecnologías de Telecomunicación (UC3M)
📍 Boadilla del Monte, Madrid
```

## 👋 Sobre mí

Soy ingeniero de telecomunicaciones recién graduado por la **Universidad Carlos III de Madrid**, con experiencia dando soporte a **redes 5G desplegadas como CNFs sobre Kubernetes**. Me apasionan la virtualización, las redes y todo lo *cloud native*.

- 📡 He trabajado en el soporte a la red 5G de **VMO2** en Datatronics (Kubernetes sobre RHEL, Helm, kubeadm).
- 🎓 Mi TFG: un **núcleo 5G SA completo de OpenAirInterface orquestado en Kubernetes**.
- 🏠 Mantengo mi propio clúster en un **homelab** (Proxmox + Raspberry Pi).
- 📚 Ahora mismo preparo la **CKA** (Certified Kubernetes Administrator) y el **C1 de inglés**.
- 💬 ¿Buscas a alguien para 5G, Kubernetes o infraestructura cloud native? [Hablemos](mailto:dani.carballoreyes@gmail.com).

## 🚀 Proyectos destacados

### 📶 [Núcleo 5G como CNFs en Kubernetes](https://c10n67.github.io/tfg.html) · TFG 2026

Red **5G Standalone** completa (5GC + RAN) de OpenAirInterface sobre Kubernetes: núcleo desplegado con **Helm**, interfaces **N2/N3/N4/N6** separadas con **Multus + macvlan** siguiendo el modelo del 3GPP, y gNB + UE conectados por *rfsimulator*.

| 8 | 4 | 7 | 0 % |
|:---:|:---:|:---:|:---:|
| pods del 5GC en *Running* y registrados en el NRF | interfaces 3GPP con Multus | incidencias diagnosticadas hasta la causa raíz | pérdida en el ping UE → Internet |

`OpenAirInterface` `Kubernetes` `Helm` `Multus` `NGAP` `GTP-U` `PFCP` `Prometheus` `Grafana` · [📄 Memoria (PDF)](https://c10n67.github.io/files/TFG_Daniel_Carballo_Reyes.pdf)

### 🌌 [Homelab Polaris](https://c10n67.github.io/homelab.html) · Kubernetes en casa

Un portátil reciclado con **Proxmox VE** dividido en dos nodos Debian, *OsaMayor* y *OsaMenor*, más *Orion*, una **Raspberry Pi 4** como tercer nodo (arm64). Clúster montado a mano con **kubeadm** y **Calico** como CNI, con **Prometheus + Grafana** para la observabilidad. Mi laboratorio para preparar la CKA.

```console
$ kubectl get nodes
NAME       STATUS   ROLES           ARCH
osamayor   Ready    control-plane   amd64
osamenor   Ready    <none>          amd64
orion      Ready    <none>          arm64
```

### 🎲 [MESA](https://github.com/C10N67/MESA)

Mapa interactivo de D&D para jugar online o en local, con vista de máster y de jugadores. Un proyecto personal.

## 🛠️ Tecnologías

**5G / Telecom**

![5G SA](https://img.shields.io/badge/5G_SA-0b1220?style=flat-square)
![OpenAirInterface](https://img.shields.io/badge/OpenAirInterface-0b1220?style=flat-square)
![3GPP](https://img.shields.io/badge/3GPP-0b1220?style=flat-square)
![NGAP · GTP--U · PFCP · SCTP](https://img.shields.io/badge/NGAP_%C2%B7_GTP--U_%C2%B7_PFCP_%C2%B7_SCTP-0b1220?style=flat-square)

**Cloud native**

![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=flat-square&logo=kubernetes&logoColor=white)
![Helm](https://img.shields.io/badge/Helm-0F1689?style=flat-square&logo=helm&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)
![Multus](https://img.shields.io/badge/Multus-555?style=flat-square)
![Calico](https://img.shields.io/badge/Calico-FB8C00?style=flat-square)
![Prometheus](https://img.shields.io/badge/Prometheus-E6522C?style=flat-square&logo=prometheus&logoColor=white)
![Grafana](https://img.shields.io/badge/Grafana-F46800?style=flat-square&logo=grafana&logoColor=white)

**Sistemas y redes**

![Linux](https://img.shields.io/badge/Linux-FCC624?style=flat-square&logo=linux&logoColor=black)
![Red Hat](https://img.shields.io/badge/RHEL-EE0000?style=flat-square&logo=redhat&logoColor=white)
![Debian](https://img.shields.io/badge/Debian-A81D33?style=flat-square&logo=debian&logoColor=white)
![Proxmox](https://img.shields.io/badge/Proxmox-E57000?style=flat-square&logo=proxmox&logoColor=white)
![Raspberry Pi](https://img.shields.io/badge/Raspberry_Pi-A22846?style=flat-square&logo=raspberrypi&logoColor=white)

**Programación**

![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)
![C](https://img.shields.io/badge/C-A8B9CC?style=flat-square&logo=c&logoColor=black)
![Java](https://img.shields.io/badge/Java-ED8B00?style=flat-square&logo=openjdk&logoColor=white)
![MATLAB](https://img.shields.io/badge/MATLAB-0076A8?style=flat-square)

## 🎓 Formación y certificaciones

- **Grado en Ingeniería de Tecnologías de Telecomunicación** · Universidad Carlos III de Madrid (2020 – 2026)
- **CKA · Certified Kubernetes Administrator** · en preparación
- **Inglés**: Cambridge B2 First · preparando el C1

<details>
<summary>🇬🇧 <b>English version</b></summary>

<br>

I'm a recently graduated **telecommunications engineer** from Universidad Carlos III de Madrid, with hands-on experience supporting **5G networks running as CNFs on Kubernetes**. I'm passionate about virtualization, networking and everything cloud native.

- 📡 Supported **VMO2's 5G network** at Datatronics (Kubernetes on RHEL, Helm, kubeadm).
- 🎓 Bachelor's thesis: a **complete OpenAirInterface 5G SA network orchestrated on Kubernetes**, with 3GPP interfaces split out using Multus and a UE carrying real end-to-end traffic. [Read the case study](https://c10n67.github.io/tfg.html).
- 🏠 I run my own **homelab** Kubernetes cluster (Proxmox + Raspberry Pi, kubeadm, Calico, Prometheus + Grafana). [Explore it](https://c10n67.github.io/homelab.html).
- 📚 Currently preparing for the **CKA** and the **C1** English certificate.
- 💬 Looking for someone to work on 5G, Kubernetes or cloud native infrastructure? [Let's talk](mailto:dani.carballoreyes@gmail.com).

</details>

<p align="center"><sub><code>kubectl get pods -n 5gc · Running</code></sub></p>
