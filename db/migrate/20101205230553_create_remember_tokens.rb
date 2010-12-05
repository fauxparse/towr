class CreateRememberTokens < ActiveRecord::Migration
  def self.up
    create_table :remember_tokens do |t|
      t.belongs_to :user, :null => false
      t.string :token, :null => false
      t.timestamps
    end
    
    add_index :remember_tokens, [ :user_id, :token ]
  end

  def self.down
    drop_table :remember_tokens
  end
end
