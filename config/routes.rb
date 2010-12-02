Towr::Application.routes.draw do
  get "login/from/:method" => "sessions#create", :as => :login_callback
  get "login/:method" => "sessions#new", :as => :login
  get "logout" => "sessions#destroy", :as => :logout
  
  root :to => "maps#index"
  get "new" => "maps#new", :as => :new_map
  get ":id" => "maps#show"
end
