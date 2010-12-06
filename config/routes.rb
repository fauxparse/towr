Towr::Application.routes.draw do
  get "login" => "sessions#index", :as => :login_prompt
  get "login/from/:method" => "sessions#create", :as => :login_callback
  get "login/:method" => "sessions#new", :as => :login
  get "logout" => "sessions#destroy", :as => :logout
  
  resources :maps

  get "my/details" => "users#edit", :as => :my_account
  put "my/details" => "users#update"
  get "my/:method" => "users#connect", :as => :connect
  get "my/:method/callback" => "users#connect_callback", :as => :connect_callback
  
  get "new" => "maps#new", :as => :new_map
  get ":id" => "maps#show", :as => :show_or_edit_map
  root :to => "maps#index"
end
