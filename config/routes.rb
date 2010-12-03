Towr::Application.routes.draw do
  get "login/from/:method" => "sessions#create", :as => :login_callback
  get "login/:method" => "sessions#new", :as => :login
  get "logout" => "sessions#destroy", :as => :logout
  
  resources :maps
  
  get "new" => "maps#new", :as => :new_map
  get ":id" => "maps#show"
  root :to => "maps#index"
end
