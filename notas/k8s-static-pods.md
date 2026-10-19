# Kubernetes: ruta de los static pods

Por defecto es `/etc/kubernetes/manifests`, pero conviene comprobarlo en cada nodo
(si es un worker, primero `ssh node01`).

```bash
# 1. Busca el fichero de configuración del kubelet
ps -aux | grep kubelet | grep -- --config
# normalmente es --config=/var/lib/kubelet/config.yaml

# 2. Mira el valor de staticPodPath
grep -i staticPodPath /var/lib/kubelet/config.yaml
# staticPodPath: /etc/kubernetes/manifests
```

En clústeres antiguos puede venir como flag del kubelet: `--pod-manifest-path`.
