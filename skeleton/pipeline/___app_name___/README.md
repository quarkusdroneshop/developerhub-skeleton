## quarkusdroneshop-${{ values.app_name }} tekton pipeline
![quarkusdroneshop-${{ values.app_name }}](../images/quarkusdroneshop-${{ values.app_name }}.png)

## Deploy pipelines using kustomize
> You may fork this repo and make edit to the `application-deployment/store/quarkusdroneshop-${{ values.app_name }}/transformer-patches.yaml` in for GitOps or argocd
---
**Create Projects and configure permissions**
```
oc new-project quarkusdroneshop-cicd
oc new-project quarkusdroneshop-demo
oc adm policy add-role-to-user admin system:serviceaccount:quarkusdroneshop-demo:pipeline -n quarkusdroneshop-cicd
oc policy add-role-to-group system:image-puller system:serviceaccounts:quarkusdroneshop-demo -n quarkusdroneshop-cicd
oc adm policy add-role-to-user admin system:serviceaccount:quarkusdroneshop-cicd:pipeline -n quarkusdroneshop-demo
```
**Run the Kustomize command to deploy pipelines** 
```
kustomize build quarkusdroneshop-${{ values.app_name }} | oc create -f - 
```

**Update Environment Variables in deployment**
```
oc edit deployment.apps/quarkusdroneshop-${{ values.app_name }}  -n quarkusdroneshop-demo
```

## Deploy pipelines Manually 
---
**configure pvc**
```
oc -n quarkusdroneshop-cicd create -f quarkusdroneshop-${{ values.app_name }}/pvc/pvc.yml
oc -n quarkusdroneshop-cicd create -f  ./quarkusdroneshop-${{ values.app_name }}/pvc/maven-source-pvc.yml
```

**configure Tasks**
```
oc -n quarkusdroneshop-cicd create -f ./common-functions/tasks/git-clone.yaml
oc -n quarkusdroneshop-cicd create -f ./common-functions/tasks/openshift-client-task.yaml
oc -n  quarkusdroneshop-cicd create -f ./common-functions/tasks/maven.yaml
```

**Configure push image to quay task**
```
oc -n  quarkusdroneshop-cicd create -f ./quarkusdroneshop-${{ values.app_name }}/tektontasks/pushImageToQuay.yaml
```

**configure Resources**
```
oc -n quarkusdroneshop-cicd create -f  ./quarkusdroneshop-${{ values.app_name }}/resources/git-pipeline-resource.yaml
oc -n quarkusdroneshop-cicd create -f  ./quarkusdroneshop-${{ values.app_name }}/resources/image-pipeline-resource.yaml
```

**Create Pipeline**
```
oc -n quarkusdroneshop-cicd create -f  ./quarkusdroneshop-${{ values.app_name }}/pipeline/deploy-pipeline.yaml
```


### Integration testing instructions 
```
oc adm policy add-role-to-user admin system:serviceaccount:quarkusdroneshop-demo:pipeline -n quarkusdroneshop-cicd
oc policy add-role-to-group system:image-puller system:serviceaccounts:quarkusdroneshop-demo -n quarkusdroneshop-cicd
oc adm policy add-role-to-user admin system:serviceaccount:quarkusdroneshop-cicd:pipeline -n quarkusdroneshop-demo

oc project quarkusdroneshop-demo
oc create -f application-deployment/store/quarkusdroneshop-${{ values.app_name }}/quarkusdroneshop-${{ values.app_name }}.yaml  -n quarkusdroneshop-demo
```

**Update Enviornment Variables in deployment**
```
oc edit deployment.apps/quarkusdroneshop-${{ values.app_name }}
```