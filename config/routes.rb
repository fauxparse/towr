Towr::Application.routes.draw do
  get "login" => "sessions#index", :as => :login_prompt
  get "login/from/:method" => "sessions#create", :as => :login_callback
  get "login/:method" => "sessions#new", :as => :login
  get "logout" => "sessions#destroy", :as => :logout
  
  resources :maps

  get "your/details" => "users#edit", :as => :account
  put "your/details" => "users#update"
  get "your/:method" => "users#connect", :as => :connect
  get "your/:method/callback" => "users#connect_callback", :as => :connect_callback
  
  get "new" => "maps#new", :as => :new_map
  get ":id" => "maps#show", :as => :show_or_edit_map
  root :to => "maps#index"
end
