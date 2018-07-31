
domains = {
  frontend: 'game-server.dev',  
}

# -*- mode: ruby -*-
# vi: set ft=ruby :
Vagrant.configure(2) do |config|
  config.vm.box = "brownell/xenial64lemp"  
  config.vm.box_check_update = false
  config.vm.hostname = "testing"  
  config.vm.network "public_network", ip: "192.168.1.100"  
  config.vm.define "tank"
  config.hostmanager.aliases            = domains.values

  config.vm.provider "virtualbox" do |vb|
     vb.gui = false
     vb.memory = "1024"
  end
end
